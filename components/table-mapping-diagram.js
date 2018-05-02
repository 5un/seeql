import React from 'react'
import ReactDOM from 'react-dom'
import * as d3 from 'd3'
import _ from 'lodash'

export default class TableMappingDiagram extends React.Component {

    componentDidUpdate(prevProps, prevState) {
        this.renderCanvas();
    }

    componentDidMount() {
        this.renderCanvas();
    }

    renderCanvas() {
        const data = this.props.data || [
            { name: "table1", mapped: 200, unmapped: 500 },
            { name: "table2", mapped: 1500, unmapped: 100 },
            { name: "table3", mapped: 400, unmapped: 200 },
        ]

        const tableBarWidth = 20
        const width = this.props.width || 200
        const height = this.props.height || 150
        const margin = {
            left: 10,
            right: 10, 
            top: 10, 
            bottom: 10
        }
        const segmentWidth = (width / data.length) - tableBarWidth

        const maxBar = _.maxBy(data, d => (d.mapped + d.unmapped))
        const maxBarValue = maxBar.mapped + maxBar.unmapped

        if(this.canvasRef) {
            const canvas = ReactDOM.findDOMNode(this.canvasRef)

            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const ds = data.map(d => {
                const tableTotal = d.mapped + d.unmapped
                const barHeight = (height - margin.top - margin.bottom) * tableTotal / maxBarValue
                const barMarginTop = (height - margin.top - margin.bottom) - barHeight
                const barMappedHeight = (height - margin.top - margin.bottom) * d.mapped / maxBarValue
                return {...d, tableTotal, barHeight, barMarginTop, barMappedHeight }
            })
            
            ds.forEach((d, i) => {
                
                ctx.fillStyle = 'rgba(220,220,220, 1.0)'
                ctx.fillRect(
                    margin.left + (i * (width / ds.length)),
                    margin.top +  d.barMarginTop,
                    tableBarWidth,
                    d.barHeight
                )

                ctx.fillStyle = 'rgba(200,200,255, 1.0)'
                ctx.fillRect(
                    margin.left + (i * (width / ds.length)),
                    margin.top +  d.barMarginTop,
                    tableBarWidth,
                    d.barMappedHeight
                )

                ctx.fillStyle = '#222222'
                ctx.font = "12px Arial"
                ctx.fillText(d.name, 
                                margin.left + (i * (width / ds.length)), 
                                height - margin.bottom + 10,
                                segmentWidth)

                if(i + 1 < ds.length) {
                    const nextData = ds[i + 1]
                    ctx.fillStyle = 'rgba(220,220,220, 0.25)'
                    ctx.beginPath();
                    ctx.moveTo(margin.left + (i * (width / ds.length)) + tableBarWidth, margin.top + d.barMarginTop)
                    ctx.lineTo(margin.left + ((i+1) * (width / ds.length)), margin.top + nextData.barMarginTop)
                    ctx.lineTo(margin.left + ((i+1) * (width / ds.length)), margin.top + nextData.barMarginTop + nextData.barHeight)
                    ctx.lineTo(margin.left + (i * (width / ds.length)) + tableBarWidth, margin.top + d.barMarginTop + d.barHeight)
                    ctx.fill()

                    ctx.fillStyle = 'rgba(200,200,255, 0.25)'
                    ctx.beginPath();
                    ctx.moveTo(margin.left + (i * (width / ds.length)) + tableBarWidth, margin.top + d.barMarginTop)
                    ctx.lineTo(margin.left + ((i+1) * (width / ds.length)), margin.top + nextData.barMarginTop)
                    ctx.lineTo(margin.left + ((i+1) * (width / ds.length)), margin.top + nextData.barMarginTop + nextData.barMappedHeight)
                    ctx.lineTo(margin.left + (i * (width / ds.length)) + tableBarWidth, margin.top + d.barMarginTop + d.barMappedHeight)
                    ctx.fill()
                }



            })
        }
    }

    render() {
        const width = this.props.width || 200
        const height = this.props.height || 150
        return (
            <div>
                <canvas ref={(ref) => {this.canvasRef = ref}} width={width} height={height}></canvas>
            </div>
        );
    }

}