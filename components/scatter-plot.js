import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import _ from 'lodash'

export default class ScatterPlot extends React.Component {

  componentDidMount() {
    this.renderD3();
  }

  componentDidUpdate(prevProps, prevState) {
    this.renderD3();
  }

  renderD3() {
    const unfilteredData = this.props.data || [];
    const { xVariable, yVariable } = this.props

    // Do not render if no variable is selected
    if(_.isNil(xVariable) || _.isNil(yVariable))
      return;

    const data = _.map(unfilteredData, (d) => (
      {
        [xVariable]: Number(d[xVariable]),
        [yVariable]: Number(d[yVariable])
      }
    ))

    var svg = d3.select(this.svgRef)
    svg.selectAll("*").remove();

    var margin = {top: 40, right: 20, bottom: 30, left: 40},
      width = 900 - margin.left - margin.right,
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
    var minX = d3.min(data, xValue)
    var maxX = d3.max(data, xValue)
    var minY = d3.min(data, yValue)
    var maxY = d3.max(data, yValue)
    var deltaX = Math.min(Math.abs(maxX - minX) * 0.1, 1.0)
    var deltaY = Math.min(Math.abs(maxY - minY) * 0.1, 1.0)
    
    xScale.domain([minX - deltaX, maxX + deltaX])
    yScale.domain([minY - deltaY, maxY + deltaY])

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
      .on("mouseover", function(d) {
          d3.select(this).style("fill", "red");
          console.log(d);
        })  
      .on("mouseout", function(d) {
        d3.select(this).style("fill", "#592FE4");
      });
      
  }

  render() {
    return (
      <div>
        <svg width={960} height={450} ref={(r) => {this.svgRef = r}}></svg>
      </div>
    );
  }

}