import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import _ from 'lodash'
import CodeMirror from 'react-codemirror'
import sqliteParser from 'sqlite-parser'
import Histogram from '../components/histogram'
import TableMappingDiagram from '../components/table-mapping-diagram'
import BigQueryHintDatasource from '../lib/bigquery-hint-datasource'
import { registerCustomSQLHint } from '../lib/custom-sql-hint'
import { findTopLevelJoinStatement } from '../lib/helpers'

const bigqueryHintDatasource = new BigQueryHintDatasource();

const autoCompletionNames = [
    { text: 'stories' },
    { text: 'comments' },
    { text: 'full' },
    { text: 'full_201510' },
    { text: 'id' },
    { text: 'score' },
    { text: 'time' },
    { text: 'time_ts' },
    { text: 'title' },
    { text: 'url' },
    { text: 'deleted' },
    { text: 'dead' },
    { text: 'descendants' },
    { text: 'author' },
    { text: 'parent' },
    { text: 'ranking' }

]

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
                // TODO Check for parsing status here
                sqliteParser(cm.getValue(), (err, ast) => {
                    if(!err) {
                        //console.log('parsed', ast)
                        const joinStmt = findTopLevelJoinStatement(ast)
                        if(joinStmt) {
                            // console.log(joinStmt)
                            // fetch join visualization
                                // mark the text
                                // Add the viz to viz list
                            
                            this.addJoinStatementVisualization(joinStmt)


                        }
                    } else {
                        // Fail silenly console.error(err)
                        
                    }
                })

                cm.showHint({ completeSingle: false, tables: autoCompletionNames })
            }, 300)

            codeMirror.on('keypress', (cm, event) => {
                debounced(cm, event);
            })
        }
        
    }

    handleCodeChanged(newValue) {
        const { codeMirror } = this.state
        const { onChange } = this.props
        const allMarks = codeMirror.getAllMarks()
        this.setState({ 
            code: newValue, 
            embeddedVisualizations: allMarks 
        })

        if(onChange) {
            onChange(newValue)
        }
    }

    addJoinStatementVisualization(joinStmt) {
        console.log('add join stmt')
        console.log(joinStmt)
        let isCompleteJoinStmt = false
        if(joinStmt.map.length > 0 && joinStmt.map[0].constraint) {
            if(joinStmt.map[0].constraint.on && joinStmt.map[0].constraint.on.left && joinStmt.map[0].constraint.on.right) {
                isCompleteJoinStmt = true
            }
        }

        const { codeMirror, embeddedVisualizations } = this.state
        const idx = codeMirror.getValue().toLowerCase().indexOf(" join ")

        if(idx != -1 && isCompleteJoinStmt && embeddedVisualizations.length == 0) {
            var start = codeMirror.posFromIndex(idx)
            var end = codeMirror.posFromIndex(idx + " join ".length)

            var vizPlaceholder = document.createElement("text")
            vizPlaceholder.innerHTML = codeMirror.getRange(start, end)
            vizPlaceholder.style.height = "100px"
            vizPlaceholder.style.display = "inline-block"
            vizPlaceholder.style.verticalAlign = "top"
            vizPlaceholder.setAttribute('data-viztype', 'tableMapping')

            const marker = codeMirror.markText(start, end, {
                replacedWith: vizPlaceholder
            });

            const tableMappingData = 
                [
                    { name: "stories.id", mapped: 483737, unmapped: 1476072 },
                    { name: "comments.parents", mapped: 2620593, unmapped: 5778824 }
                ]

            const allMarks = codeMirror.getAllMarks()
            this.setState({ embeddedVisualizations: allMarks, tableMappingData })
        }

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
        vizPlaceholder.setAttribute('data-viztype', 'histogram')

        const marker = codeMirror.markText(start, end, {
            replacedWith: vizPlaceholder
        });

        const allMarks = codeMirror.getAllMarks()
        this.setState({ embeddedVisualizations: allMarks })

    }

    addEmbeddedVisualization(text) {
        
    }

    render() {
        const { scriptLoaded, embeddedVisualizations, tableMappingData } = this.state
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
                            top: viz.widgetNode.offsetTop + '30' + 'px',
                            zIndex: 1000 }}>
                        {/*
                            viz.widgetNode.getAttribute('data-viztype') == 'historgram' &&
                            <Histogram data={[1,2,3,4,4,5,5,6,6,6,7,7,8,8,9,10]} 
                            width={150} height={50}/>
                        */}
                        
                        <TableMappingDiagram width={200} height={100} data={tableMappingData}/>
                        
                        
                    </div>
                ))}
                
            </div>
        );
    }

}