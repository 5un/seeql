import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import _ from 'lodash'
import CodeMirror from 'react-codemirror'
import Histogram from '../components/histogram'
import BigQueryHintDatasource from '../lib/bigquery-hint-datasource'
import { registerCustomSQLHint } from '../lib/custom-sql-hint'

const bigqueryHintDatasource = new BigQueryHintDatasource();

export default class QueryEditor extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            scriptLoaded: false,
            code: "-- Type your Query here\n",
            codeMirror: null,
            embeddedVisualizations: []
        }
    }

    componentDidMount() {
        if (typeof window != 'undefined') {
            Promise.all([
                import('codemirror/mode/sql/sql'),
                import('codemirror/addon/hint/show-hint'),
            ]).then(result => {
                this.setState({ scriptLoaded: true })
            });

        }
    }

    handleCodeMirrorRef(codeMirrorRef) {

        if(codeMirrorRef) {
            registerCustomSQLHint(codeMirrorRef.getCodeMirrorInstance(), bigqueryHintDatasource)

            const codeMirror = codeMirrorRef.codeMirror
            if(this.state.codeMirror == null) {
                this.setState({ codeMirror })
            }

            const debounced = _.debounce((cm, event) => {
                cm.showHint({ completeSingle: false })
            }, 300)

            codeMirror.on('keypress', (cm, event) => {
                debounced(cm, event);
            })
        }
        
    }

    handleCodeChanged(newValue) {
        const { codeMirror } = this.state
        const allMarks = codeMirror.getAllMarks()
        this.setState({ 
            code: newValue, 
            embeddedVisualizations: allMarks 
        })
    }

    testMarkElem() {
        const { codeMirror, embeddedVisualizations } = this.state
        var start = {line: 0, ch: 14}
        var end = {line: 0, ch: 19}

        var vizPlaceholder = document.createElement("text")
        vizPlaceholder.innerHTML = codeMirror.getRange(start, end)
        vizPlaceholder.style.height = "70px"
        vizPlaceholder.style.display = "inline-block"
        vizPlaceholder.style.verticalAlign = "top"

        const marker = codeMirror.markText(start, end, {
            replacedWith: vizPlaceholder
        });

        const allMarks = codeMirror.getAllMarks()
        this.setState({ embeddedVisualizations: allMarks })

    }

    addEmbeddedVisualization(text) {
        
    }

    render() {
        const { scriptLoaded, embeddedVisualizations } = this.state
        const options = {
            lineNumbers: true,
            mode: 'text/x-mysql'
        };
        return (
            <div style={{ position: 'relative' }}>
                {scriptLoaded &&
                    <CodeMirror 
                        value={this.state.code} 
                        onChange={this.handleCodeChanged.bind(this)} 
                        options={options} 
                        ref={this.handleCodeMirrorRef.bind(this)}
                    />
                }
                {embeddedVisualizations.map(viz => (
                    <div key={viz.id}
                        style={{ position: 'absolute', 
                            left: viz.widgetNode.offsetLeft + 'px', 
                            top: viz.widgetNode.offsetTop + '16' + 'px',
                            zIndex: 1000 }}>
                        <Histogram data={[1,2,3,4,4,5,5,6,6,6,7,7,8,8,9,10]} 
                            width={150} height={50}/>
                    </div>
                ))}
                
            </div>
        );
    }

}