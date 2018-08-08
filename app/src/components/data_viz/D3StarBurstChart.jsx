import React, { Component } from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';

import DisplayButton from './helper_components/DisplayButton.jsx';
import * as chart from '../../redux/constants/chartProperties.js';
import { displaySizes, displayFactoryTimes, displayBuildingTimes } from '../../redux/actions/chartActions.js';

const rootData = { "name": "rootData", "children": [] };

class D3StarBurstChart extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.initStarburstChart();
    this.instantiateStarburstChart();
  }

  componentDidUpdate() {
    this.instantiateStarburstChart();
  }

  initStarburstChart() {
    this.total = {};
    this.total.size = 0;
    this.total.factory = 0;
    this.total.building = 0;

    // this.props.data.starBurstData;
    console.log(this.props.dataToDisplay, "DATA TO BE DISPLAYED")
    let displayStats = this.props.dataToDisplay; //this.props.data.starBurstData
    console.log(displayStats, "WHAT AM I")
    




    displayStats.chunks[0].modules.forEach(element => {0

      let directoryAndName = element.name.replace(/[.\/]/, "");
      let parts = directoryAndName.replace(/[.\/]/, "").split("/");

      var currentNode = rootData;
      for (var j = 0; j < parts.length; j++) {

        var children = currentNode["children"];
        var nodeName = parts[j];
        var childNode;
        if (j + 1 < parts.length) {
          // Not yet at the end of the sequence; move down the tree.
          var foundChild = false;
          for (var k = 0; k < children.length; k++) {
            if (children[k]["name"] == nodeName) {
              childNode = children[k];
              foundChild = true;
              break;
            }
          }
          // If we don't already have a child node for this branch, create it.
          if (!foundChild) {
            childNode = { "name": nodeName, "children": [] };
            children.push(childNode);
          }
          currentNode = childNode;
        } else {
          // Reached the end of the sequence; create a leaf node.
          const size = element.size || 0;
          const factory = element.profile ? element.profile.factory : 0;
          const building = element.profile ? element.profile.building : 0;
          console.log(this, "THISSSSSSSSSSSSSSSSSSSSSSSSS")

          this.total.size += Number(size);
          this.total.factory += Number(factory);
          this.total.building += Number(building);
          childNode = { "name": nodeName, size, factory, building };
          children.push(childNode);
        }
      }
    });
  }

  instantiateStarburstChart() {

    const mouseover = d => {
      // Get total size of the tree = value of rootData node from partition.
      //   totalSize = path.datum().value;
      var percentage = (100.0 * d.value / this.total[this.props.chart.screen]).toPrecision(3);

      var percentageString = percentage + "%";
      if (percentage < 0.1) {
        percentageString = "< 0.1%";
      }


      d3.select("#sb_d3_percentage")
        .text(percentageString);
      //ADDED FILE NAME-
      d3.select("#sb_d3_filename")
        .text(d.data.name)

      //ADDED FILE VALUE
      d3.select("#sb_d3_filevalue")
        .text(d.value / 1000) // units of kb or seconds

      d3.select("#sb_d3_explanation")
        .style("visibility", "");
    }

    // remove <g> element from <svg>
    d3.selectAll('.starburstgroup').remove();

    // Dimensions of sunburst
    // TODO: should be dynamic
    var width = 900;
    var height = 900;
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    //d3.scaleOrdinal(); // d3.category10()

    // Size our <svg> element, add a <g> element, and move translate 0,0 to the center of the element.
    var g = d3.select('#svgStarBurst')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('class', 'starburstgroup')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Create our sunburst data structure and size it.
    var partition = d3.partition()
      .size([2 * Math.PI, radius]);

    // Attempt to get the data from our JSON file
    // console.log("before data");

    // Find the rootData node of our data, and begin sizing process.
    var global = d3.hierarchy(rootData) // starBurstData imported file
      .sum(d => { return d[this.props.chart.screen]; });
    // .sum(function (d) { return 10});

    // Calculate the sizes of each arc that we'll draw later.
    partition(global);
    var arc = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 })
      .outerRadius(function (d) { return d.y1 });

    // Add a <g> element for each node in thd data, then append <path> elements and draw lines based on the arc
    // variable calculations. Last, color the lines and the slices.
    g.selectAll('g')
      .data(global.descendants())
      .enter().append('g').attr("class", "node").append('path')
      .attr("display", function (d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .style('stroke', '#fff')
      .style("fill", function (d) { return color((d.children ? d : d.parent).data.name); })
      .on("mouseover", mouseover);
  }

  render() {
    console.log(this.props.dataToDisplay, "D3 SB")
    return (
      <div className="d3">
      <p>{this.props.chart.bundleType}</p>
        <div className="sb_d3_container">
          <DisplayButton handleClick={this.props.displaySizes} 
          isHighligthed={this.props.chart.screen === chart.SIZE} >{'Sizes'}</DisplayButton>
          <DisplayButton handleClick={this.props.displayFactoryTimes}  
          isHighligthed={this.props.chart.screen === chart.FACTORY_TIME}>{'Factory Times'}</DisplayButton>
          <DisplayButton handleClick={this.props.displayBuildingTimes} 
          isHighligthed={this.props.chart.screen === chart.BUILDING_TIME}>{'Building Times'}</DisplayButton>
        </div>
        <div id="sb_d3_explanation">
          <span id="sb_d3_filename"></span><br />
          <span id="sb_d3_percentage"></span><br />
          of your bundle
        {this.props.chart.screen === chart.SIZE ? <span>Size: <span id="sb_d3_filevalue"></span> kb</span> : <span>Time: <span id="sb_d3_filevalue"></span> s</span>}
        </div>
        <div className="sb_d3_box">
          <svg id="svgStarBurst" className="d3_starburst" ref={(elem) => { this.svg = elem; }}>
          </svg>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => (
  {
    displaySizes: () => dispatch(displaySizes()),
    displayFactoryTimes: () => dispatch(displayFactoryTimes()),
    displayBuildingTimes: () => dispatch(displayBuildingTimes()),
  }
);

const mapStateToProps = (state) => (
  { chart: state.chart, data: state.data }
)

export default connect(mapStateToProps, mapDispatchToProps)(D3StarBurstChart);
