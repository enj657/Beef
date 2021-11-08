function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);

}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}



// Create the buildChart function.
function buildCharts(sample) {
  // Use d3.json to load the samples.json file 
  d3.json("samples.json").then((data) => {
    // Create a variable that holds the samples array. 
    var samples = data.samples;
    // Create a variable that filters the samples for the object with the desired sample number.
    var resultArraySamples = samples.filter(sampleObj => sampleObj.id == sample);
    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata;
    var resultArrayMetadata = metadata.filter(sampleObj => sampleObj.id == sample);

    // Create a variable that holds the first sample in the array.
    var resultSamples = resultArraySamples[0];

    // 2. Create a variable that holds the first sample in the metadata array.
    var resultMetadata = resultArrayMetadata[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = resultSamples.otu_ids;
    var otu_labels = resultSamples.otu_labels;
    var sample_values = resultSamples.sample_values;

    // 3. Create a variable that holds the washing frequency.
    var washingFreq = resultMetadata.wfreq;

    // Create the yticks for the bar chart.
    var yticks = otu_ids.slice(0, 10).reverse();

    // Create the trace for the bar chart.
    var barData = [{
      x: yticks.map(id => sample_values[otu_ids.indexOf(id)]),
      y: yticks.map(id => "OTU " + id),
      type: "bar",
      orientation: "h",
      hovertemplate: otu_labels
    }];

    // Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      margin: { t: 100, b: 20 }
    }

    var plotConfig = {responsive: true}

    // Use Plotly to plot the bar data and layout.
    Plotly.newPlot("bar", barData, barLayout, plotConfig);

    // Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
      marker: {
        size: sample_values,
        sizeref: 1,
        color: otu_ids,
        colorscale: 'Earth'
      }

    }];

    // Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID" }
    };

    // Use Plotly to plot the bubble data and layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout, plotConfig);

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      gauge: {
        axis: { range: [null, 10], tickcolor: "black" },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "lightgreen" },
          { range: [8, 10], color: "green" }
        ],
        bar: { color: "black" }
      },
      value: washingFreq,
      title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week" },
      type: "indicator",
      mode: "gauge+number",
      
    }];

    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      margin: { t: 100, b: 20 }
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout, plotConfig);
  });
}
