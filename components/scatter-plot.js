import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'

export default class ScatterPlot extends React.Component {

  componentDidUpdate(prevProps, prevState) {
    this.renderD3();
  }

  componentDidUpdate(prevProps, prevState) {
    this.renderD3();
  }

  renderD3() {
    const data = this.props.data || [];
    const { xVariable, yVariable } = this.props

    // Do not render if no variable is selected
    if(typeof xVariable === 'undefined' || typeof yVariable === 'undefined')
      return;

    // add the graph canvas to the body of the webpage
    const node = this.node

    //var svg = d3.select(ReactDOM.findDOMNode(this.svgRef))
    var svg = d3.select(this.svgRef)
    svg.selectAll("*").remove();
    //var svg = d3.select(this.node);

    var margin = {top: 40, right: 20, bottom: 30, left: 30},
      width = 960 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom

    // setup x 
    var xValue = (d) => ( d[xVariable] ),
      xScale = d3.scaleLinear().range([0, width]),
      xMap = (d) => ( xScale(xValue(d)) ),
      xAxis = d3.axisBottom(xScale)

    // setup y
    var yValue = (d) => ( d[yVariable] ),
      yScale = d3.scaleLinear().range([height, 0]),
      yMap = (d) => ( yScale(yValue(d)) ),
      yAxis = d3.axisLeft(yScale)

    var g =svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")

    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])
    yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])

    // x-axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    
    // x-axis label
    g.append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", height - 10)
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .text(xVariable)

    // y-axis
    g.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    
    // y-axis label
    g.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .text(yVariable)

    // draw dots
    g.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", "#592FE4")
      
  }

  render() {
    return (
      <div>
        <svg width={960} height={450} ref={(r) => {this.svgRef = r}}></svg>
      </div>
    );
  }

}