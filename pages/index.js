import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Link from 'next/link'
import superagent from 'superagent'
import ReactTable from 'react-table'
import CodeMirror from 'react-codemirror'
import _ from 'lodash'

import { parseColumnNames, filterNumericColumnNames } from '../lib/helpers'
import { Container, Row, Col, Nav, NavTitle, Section, CenterPageWrapper,
          Label, H2, H3, SecondaryText, PadBox, BrandingIcon, Button, 
          QueryContainer, MainContainer } from '../components/elements'
import AxisSelect from '../components/axis-select'
import Histogram from '../components/histogram'
import ScatterPlot from '../components/scatter-plot'

import globalCss from '../styles/global-css.js'
import reactTableCss from '../styles/react-table-css.js'
import codeMirrorCss from '../styles/react-codemirror-css.js'

const API_URL = 'https://us-central1-see-ql.cloudfunctions.net'

export default class Index extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      variables: [],
      xPreviewValues: [],
      yPreviewValues: [],
      isFrontEnd: false,
      code: "-- Type your Query here\n",
      codeMirror: null
    }
  }

  componentDidMount() {
    if (typeof window != 'undefined') {
      Promise.all([
        import('codemirror/mode/sql/sql'),
        import('codemirror/addon/hint/show-hint'),
        import('codemirror/addon/hint/sql-hint')

      ]).then(result => {
        console.log('loaded all');
        this.setState({ isFrontEnd: true })
      });
      // Promise.all([
      //   import('brace')
      // ]).then(result => {
      //   this.setState({ brace: result })
      //   return import('react-ace')
      // }).then(result => {
      //   console.log(result);
      //   this.setState({ AceEditor: result.default })
      //   return import('brace/mode/sql')
      // }).then(result => {
      //   console.log(result);
      //   return import('brace/theme/xcode');
      // }).then(result => {
      //   console.log(result);
      //   console.log('loaded all');
      //   this.setState({ isFrontEnd: true })
      // });
    }
  }

  handleCodeMirrorRef(codeMirrorRef) {
    if(codeMirrorRef) {
      const codeMirror = codeMirrorRef.codeMirror
      if(this.state.codeMirror == null) {
        this.setState({ codeMirror })
      }
      codeMirror.on('keypress', (cm, event) => {
        cm.showHint({ completeSingle: false })

      })

    }
    
  }

  handleVariableChanged(axis, newVariableName) {
    const { data } = this.state
    this.setState({ 
      [`${axis}PreviewValues`]: data.map(item => (item[newVariableName])),
      [`${axis}SelectedVariable`]: newVariableName
    })
  }

  handleCodeChanged(newValue) {
    console.log('change',newValue);
    this.setState({ code: newValue });
  }

  handleExecuteQueryClicked() {
    this.setState({ queryLoading: true })
    superagent.get(`${API_URL}/executeQuery`)
      .then(res => {
        const columns = _.keys(res.body[0]).map(k => ({ Header: k, accessor: k }))
        this.setState({ queryResults: res.body, queryResultColums: columns })
      })
      .catch(err => {
        this.setState({ error: err })
      })
  }

  render() {
    const { isFrontEnd, AceEditor, queryResults, queryResultColums } = this.state
    const allGlobalCss = [globalCss, reactTableCss, codeMirrorCss].join('\n');
    const options = {
      lineNumbers: true,
      mode: 'text/x-sql'
    };
    return (
      <div>
        <style jsx global>{allGlobalCss}</style>
        <Nav>
          <NavTitle>
            {/*<BrandingIcon src="/static/images/icons8-telescope-100.png"/>*/} SEEQL
          </NavTitle>
        </Nav>

        <CenterPageWrapper>
          <MainContainer>
            <H3>QUERY</H3><br />
            {isFrontEnd &&
              <QueryContainer>
                <CodeMirror value={this.state.code} onChange={this.handleCodeChanged.bind(this)} options={options} ref={this.handleCodeMirrorRef.bind(this)}/>
              </QueryContainer>
            }
            <br /><br />
            <div>
              <Button onClick={this.handleExecuteQueryClicked.bind(this)}>Execute Query</Button>
            </div>
            
            {/*
              <Highlight className='sql'>
                <div contentEditable="true" style={{ border: '1px solid gray'}}>
                  select * from `github_repos` <br />
                  <div contentEditable="false" style={{ display: 'inline-block', width: '150px', height: '80px'}}></div> 
                  where username = '5un'
                </div>
              </Highlight>
            */}
            {/*
              <Histogram data={[1,2,3,4,4,5,5,6,6,6,7,7,8,8,9,10]}/>
            */}
            {queryResults && 
              <ReactTable
                data={queryResults}
                columns={queryResultColums}
                defaultPageSize={5}
                className="-striped -highlight"
              />
            }
          </MainContainer>
        </CenterPageWrapper>
      </div>
    );
  }

}