import React from 'react'
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import Link from 'next/link'
import superagent from 'superagent'
import { csvParse } from 'd3-dsv'
import { parseColumnNames } from '../lib/helpers'
import { Container, Row, Col, Nav, NavTitle, Section, Label, H2, SecondaryText } from '../components/elements'
import AxisSelect from '../components/axis-select'
import Histogram from '../components/histogram'
import ScatterPlot from '../components/scatter-plot'
import globalCss from '../styles/global-css.js'

export default class Index extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      variables: [],
      xPreviewValues: [],
      yPreviewValues: [],
    }
  }

  componentDidMount() {
    this.setState({ loading: true })
    superagent.get('/static/data/phl_hec_all_confirmed.csv')
      .then(res => {
        const data = csvParse(res.text)
        const variables = parseColumnNames(res.text)

        this.setState({ loading: false, data, variables })
      })
      .catch(err => {
        this.setState({ error: err })
      })
  }

  handleVariableChanged(axis, newVariableName) {
    const { data } = this.state
    this.setState({ 
      [`${axis}PreviewValues`]: data.map(item => (item[newVariableName])),
      [`${axis}SelectedVariable`]: newVariableName
    })
  }

  render() {
    const { data, loading, variables, xPreviewValues, yPreviewValues,
            xSelectedVariable, ySelectedVariable } = this.state
    const variableSelected = typeof xSelectedVariable !== 'undefined'
                            && typeof ySelectedVariable !== 'undefined'

    return (
      <div>
        <style jsx global>{globalCss}</style>
        <Nav>
          <NavTitle>
            Exoplanet Data Explorer
          </NavTitle>
        </Nav>
        {!loading &&
          <div>
            <Section>
              <Container>
              <Row>
                <Col width={'50%'} maxWidth={'300px'} >
                  <Label>X-Axis</Label>
                  <AxisSelect 
                    variables={variables}
                    onVariableChanged={this.handleVariableChanged.bind(this, 'x')}
                    variableValues={xPreviewValues} />
                </Col>
                <Col width={'50%'} maxWidth={'300px'}>
                  <Label>Y-Axis</Label>
                  <AxisSelect
                    variables={variables}
                    onVariableChanged={this.handleVariableChanged.bind(this, 'y')}
                    variableValues={yPreviewValues} />
                </Col>
              </Row>
              </Container>
            </Section>

            {variableSelected &&
              <Container>
                <H2>{xSelectedVariable} v. {ySelectedVariable}</H2>
                <ScatterPlot 
                  data={data}
                  xVariable={xSelectedVariable}
                  yVariable={ySelectedVariable} />
              </Container>
            }

            {!variableSelected &&
              <SecondaryText>Please select x-axis and y-axis variables</SecondaryText>
            }
          </div>
        }
      </div>
    );
  }

}