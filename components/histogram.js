import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import _ from 'lodash'

export default class Histogram extends React.Component {

    componentDidUpdate(prevProps, prevState) {
        this.renderD3();
    }

    componentDidMount() {
        this.renderD3();
    }

    renderD3() {
        const unfilteredData = this.props.data || [];
        const data = _.map(unfilteredData, Number)

        var formatCount = d3.format(",.0f");
        
        var svg = d3.select(ReactDOM.findDOMNode(this.svgRef))
        svg.selectAll("*").remove();

        var margin = { top: 10, right: 50, bottom: 18, left: 10 },
            width = svg.attr("width") - margin.left - margin.right,
            height = svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        var minX = d3.min(data)
        var maxX = d3.max(data)
        var delta = Math.abs(maxX - minX) * 0.05

        var x = d3.scaleLinear()
            .domain([minX - delta, maxX + delta])
            .rangeRound([0, width])

        var bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(10))
            (data);

        var y = d3.scaleLinear()
            .domain([0, d3.max(bins, (d) => ( d.length ))])
            .range([height, 0]);

        var bar = g.selectAll(".bar")
          .data(bins)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", (d) => ("translate(" + x(d.x0) + "," + y(d.length) + ")") )
            .style("fill", "#8569E1")


        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("height", (d) => ( height - y(d.length) ))

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(6))
            
    }

    render() {
        const {width, height} = this.props
        return (
            <div>
                <svg width={width} height={height} ref={(r) => {this.svgRef = r}}></svg>
            </div>
        );
    }

}