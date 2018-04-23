import React from 'react'
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import Link from 'next/link'
import superagent from 'superagent'
import { csvParse } from 'd3-dsv'
import { parseColumnNames, filterNumericColumnNames } from '../lib/helpers'
import { Container, Row, Col, Nav, NavTitle, Section, CenterPageWrapper,
          Label, H2, H3, SecondaryText, PadBox, BrandingIcon, Button, QueryContainer, MainContainer } from '../components/elements'
import AxisSelect from '../components/axis-select'
import Histogram from '../components/histogram'
import ScatterPlot from '../components/scatter-plot'
import globalCss from '../styles/global-css.js'
import reactTableCss from '../styles/react-table-css.js'
import ReactTable from "react-table"
import _ from 'lodash'

const API_URL = 'https://us-central1-see-ql.cloudfunctions.net'

export default class Index extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      variables: [],
      xPreviewValues: [],
      yPreviewValues: [],
      isFrontEnd: false
    }
  }

  componentDidMount() {
    if (typeof window != 'undefined') {
      Promise.all([
        import('brace')
      ]).then(result => {
        this.setState({ brace: result })
        return import('react-ace')
      }).then(result => {
        console.log(result);
        this.setState({ AceEditor: result.default })
        return import('brace/mode/sql')
      }).then(result => {
        console.log(result);
        return import('brace/theme/xcode');
      }).then(result => {
        console.log(result);
        console.log('loaded all');
        this.setState({ isFrontEnd: true })
      });
    }
    
    // superagent.get('/static/data/phl_hec_all_confirmed.csv')
    //   .then(res => {
    //     const data = csvParse(res.text)
    //     const variables = filterNumericColumnNames(parseColumnNames(res.text))
    //     this.setState({ loading: false, data, variables })
    //   })
    //   .catch(err => {
    //     this.setState({ error: err })
    //   })
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
    const allGlobalCss = globalCss + reactTableCss
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
                <AceEditor
                  mode="sql"
                  theme="xcode"
                  onChange={this.handleCodeChanged.bind(this)}
                  name="UNIQUE_ID_OF_DIV"
                  editorProps={{$blockScrolling: true}}
                  width="800px"
                  height="300px"
                  defaultValue="select * from `github_repos` where username = '5un'"
                  fontSize={14}
                  enableBasicAutocompletion={true}
                  enableLiveAutocompletion={true}
                  markers={[
                    { startRow:0, startCol:2, endRow: 0, endCol: 5, className: 'error-marker', type: 'background' }
                  ]}
                />
              </QueryContainer>
            }
            <br /><br />
            <div>
              <Button onClick={this.handleExecuteQueryClicked.bind(this)}>Execute Query</Button>
            </div>
            <br />
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