import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Link from 'next/link'
import superagent from 'superagent'
import ReactTable from 'react-table'
import _ from 'lodash'
import config from '../config/config'

import { parseColumnNames, filterNumericColumnNames } from '../lib/helpers'
import { Container, Row, Col, Nav, NavTitle, Section, CenterPageWrapper,
          Label, H2, H3, SecondaryText, PadBox, BrandingIcon, Button, 
          QueryContainer, MainContainer } from '../components/elements'

import QueryEditor from '../components/query-editor'

import globalCss from '../styles/global-css.js'
import reactTableCss from '../styles/react-table-css.js'
import codeMirrorCss from '../styles/react-codemirror-css.js'


export default class Index extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      variables: [],
      xPreviewValues: [],
      yPreviewValues: [],
      isFrontEnd: false,
      query: ''
    }
  }

  handleExecuteQueryClicked() {
    const { query } = this.state

    this.setState({ queryLoading: true })
    superagent.post(`${config.API_URL}/executeQuery`)
      .send({ query })
      .then(res => {
        const columns = _.keys(res.body[0]).map(k => ({ Header: k, accessor: k }))
        this.setState({ queryResults: res.body, queryResultColums: columns })
      })
      .catch(err => {
        this.setState({ error: err })
      })
  }

  handleCodeChanged(query) {
    this.setState({ query })
  }

  render() {
    const { isFrontEnd, AceEditor, queryResults, queryResultColums } = this.state
    const allGlobalCss = [globalCss, reactTableCss, codeMirrorCss].join('\n');
    
    return (
      <div>
        <style jsx global>{allGlobalCss}</style>
        <Nav>
          <NavTitle>
            <BrandingIcon src="/static/images/icons8-gantt-chart-100.png"/> SEEQL
          </NavTitle>
        </Nav>

        <CenterPageWrapper>
          <MainContainer>
            <H3>QUERY</H3><br />
            <QueryContainer>
              <QueryEditor ref={(ref) => this.QueryEditorRef = ref } onChange={this.handleCodeChanged.bind(this)}/>
            </QueryContainer>
            <br /><br />
            <div>
              <Button onClick={this.handleExecuteQueryClicked.bind(this)}>Execute Query</Button>
            </div>
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