import React from 'react'
import ReactDOM from 'react-dom'
import Link from 'next/link'
import Histogram from './histogram'
import { Select } from './elements'

export default class AxisSelect extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  handleChange(event) {
    const selectedVariable = event.target.value
    this.setState({ selectedVariable })
    if(this.props.onVariableChanged) {
      this.props.onVariableChanged(selectedVariable)
    }
  }

  render() {
    const { variables, variableValues } = this.props;
    const { selectedVariable } = this.state;
    return (
      <div>
        <Select value={selectedVariable} onChange={this.handleChange.bind(this)} >
          <option value="">(Please Select)</option>
          {variables.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
        <Histogram data={variableValues} />
      </div>
    );
  }

}