'use strict';

// Module to keep track of our designer page.
angular.module('vizualizeItApp')
  .controller('DesignerCtrl', function ($scope,componentLoaderService,previewService,flowchartService) {

    // Initially, get the list of components from the server. Then setup our page
    // and start the preview with a blank setup.
    componentLoaderService.getComponents(function (componentList) {
      // Ugly series of callbacks to get the first 3 components independent of
      // the flowchart system.
      componentLoaderService.getComponent(componentList[0]._id,function (flatGeomText) {
        componentLoaderService.getComponent(componentList[1]._id,function (flatVertexShaderText) {
          componentLoaderService.getComponent(componentList[2]._id,function (flatFragmentShaderText) {
            // Read the data in the geometry file as geometric data. Render to
            // the preview canvas.
            previewService.render(PlyReader().parse(flatGeomText),flatVertexShaderText,flatFragmentShaderText);
          });
        });
      });

      // We'll make a class to hold data about each component in our flowchart.
      // Store each component's raw data from the server in a 'hash' field.
      var FlowchartComponent = class {
        constructor(hash) {
          this.hash = hash;
          this.x = 0;
          this.y = 0;
        }
      }

      // Make an object for our flowchart. Give it a reference to it's canvas.
      // Set our initialization function, and make new flowchart components based
      // on our server response.
      $scope.flowchart = {};
      $scope.flowchart.canvas = document.getElementById("flowchart");
      $scope.flowchart.activeComponents = [];
      $scope.flowchart.placeNewComponent = flowchartPlaceNewComponent;
      $scope.flowchart.items = componentList.map(function (flowchartComponentHash) {
        return new FlowchartComponent(flowchartComponentHash);
      });

      // Print out the list of items in our system.
      console.log($scope.flowchart.items);

      // Set our page to listen for keypresses with jQuery.
      $(document).keypress(function (e) {
        if (e.keyCode == 13) { // Enter
          $scope.loadComponentData();
        } else {
          var index = e.keyCode-48; // Hopefully the number keys
          // Clone the component selected from our list, add it to our flowchart.
          $scope.flowchart.placeNewComponent(new FlowchartComponent($scope.flowchart.items[index].hash));
          flowchartService.addComponent();
        }
      });
    });

    // Add a component to flowchart.
    var flowchartPlaceNewComponent = function (component) {
      $scope.$apply(function () {
        $scope.flowchart.activeComponents.push(component);
      })
    }

    // Lazy load the actual data for each component.
    $scope.loadComponentData = function () {
      flowchartService.saveFlowchartData();
      // For now, we just get the component order (for the actual visualizer
      // layering) from the left to right ordering.
      $scope.flowchart.activeComponents.sort(function (a,b) {
        return a.x - b.x;
      });

      // Iterate over components, keeping track of how many components need
      // processing. When each component is finished being processed, check to
      // see if all components have been processed. If so, begin rendering to the
      // preview canvas (todo).
      $scope.componentsToRetrieve = $scope.flowchart.activeComponents.length;
      $scope.flowchart.activeComponents.forEach(function (component) {
        if (component.text === undefined) {
          componentLoaderService.getComponent(component.hash._id,function (textData) {
            component.text = textData;
          });
        }
        $scope.componentsToRetrieve--;
        if ($scope.componentsToRetrieve == 0) {
          // TODO: Actually implement from this point on.
          //console.log($scope.flowchart.activeComponents);
        }
      });
    }
  });
