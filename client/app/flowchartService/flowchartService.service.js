'use strict';

angular.module('vizualizeItApp')
  .service('flowchartService', function() {
    var componentDeletionCallback = null;
    var newConnectionCallback = null;
    var globalInstance;
    var localActiveComponents = [];

    // Method to initialize jsPlumb.
    var setup = function() {
      var instance = jsPlumb.getInstance({
        // Setup basic jsPlumb styles for components.
        DragOptions: {
          cursor: 'pointer',
          zIndex: 2000
        },
        ConnectionOverlays: [
            [ "Arrow", { location: 1 } ],
            [ "Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
        ],
        Container: "flowchart-demo"
      });
      var basicType = {
        connector: "StateMachine",
        paintStyle: {
          strokeStyle: "black",
          lineWidth: 1
        },
        hoverPaintStyle: {
          strokeStyle: "black"
        },
        overlays: [
          "Arrow"
        ]
      }
      instance.registerConnectionType("basic", basicType);
      return instance;
    };

    // Method to tell the flowchart what to do when deleting a component.
    this.registerComponentDeletionCallback = function (callback) {
      componentDeletionCallback = callback;
    };

    this.registerNewConnectionCallback = function (callback) {
      newConnectionCallback = callback;
      callback();
    }

    // Method to update the appearance of the flowchart when a new component is
    // added.
    this.updateFlowchart = function () {
      // Appearance for connecting lines.
      var connectorPaintStyle = {
          lineWidth: 4,
          strokeStyle: "#61B7CF",
          joinstyle: "round",
          outlineColor: "white",
          outlineWidth: 2
        },
        // Style for hovering over endpoints.
        connectorHoverStyle = {
          lineWidth: 4,
          strokeStyle: "#216477",
          outlineWidth: 2,
          outlineColor: "white"
        },
        endpointHoverStyle = {
          fillStyle: "#216477",
          strokeStyle: "#216477"
        },
        // General endpoint styles
        sourceEndpoint = {
          endpoint: "Dot",
          paintStyle: {
            strokeStyle: "#7AB02C",
            fillStyle: "transparent",
            radius: 7,
            lineWidth: 3
          },
          isSource: true,
          connector: ["Flowchart", {
            stub: [40, 60],
            gap: 10,
            cornerRadius: 5,
            alwaysRespectStubs: true
          }],
          connectorStyle: connectorPaintStyle,
          hoverPaintStyle: endpointHoverStyle,
          connectorHoverStyle: connectorHoverStyle,
          dragOptions: {},
          overlays: [
            ["Label", {
              location: [0.5, 1.5],
              label: "out",
              cssClass: "endpointSourceLabel"
            }]
          ]
        },
        targetEndpoint = {
          endpoint: "Dot",
          paintStyle: {
            fillStyle: "#7AB02C",
            radius: 11
          },
          hoverPaintStyle: endpointHoverStyle,
          maxConnections: -1,
          dropOptions: {
            hoverClass: "hover",
            activeClass: "active"
          },
          isTarget: true,
          overlays: [
            ["Label", {
              location: [0.5, -0.5],
              label: "in",
              cssClass: "endpointTargetLabel"
            }]
          ]
        }, // Function that assigns labels. Necessary, but removed later in CSS.
        init = function (connection) {
          connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

        // Method to automatically add endpoints for simple (1 input & 1 output)
        // components.
        var addEndpoints = function (toId, sourceAnchors, targetAnchors) {
          // Iterate over all position to add endpoints (anchors).
          for (var i = 0; i < sourceAnchors.length; i++) {
            // Create a unique id for each endpoint.
            var sourceUUID = toId + sourceAnchors[i];
            globalInstance.addEndpoint(toId, sourceEndpoint, { anchor: sourceAnchors[i], uuid: sourceUUID
            });
          }
          for (var j = 0; j < targetAnchors.length; j++) {
            var targetUUID = toId + targetAnchors[j];
            console.log(targetUUID);
            globalInstance.addEndpoint(toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
          }
        };

        // Update logic.
        globalInstance.batch(function() {

          // Save the graph before we reset.
          var oldGraph = saveFlowchartData();

          // Remove all components.
          globalInstance.reset();

          // For each element in activeComponents, add endpoints.
          for (let component of localActiveComponents) {
            addEndpoints(component.domElementId, ["RightMiddle"], ["LeftMiddle"]);
            document.getElementById(component.domElementId).addEventListener("dblclick", function (e) {
              if (e.processedByVisualizeIt == true) {
                return;
              }
              e.processedByVisualizeIt = true;
              e.stopPropagation();
              globalInstance.remove(e.srcElement);
              componentDeletionCallback(e.srcElement.id);
              newConnectionCallback();
            });
          }

          // Add Vertex, Fragment and Geometry endpoint for display component.
          globalInstance.addEndpoint("flowchartWindow0", targetEndpoint, { anchor: "LeftMiddle", uuid: "flowchartWindow0LeftMiddle" });

          // Add back all of the old connections.
          for (let edge of oldGraph.edges) {
            globalInstance.connect({ uuids:[edge.fromUUID, edge.toUUID] });
          }

          // Set jsPlumb to listen for new connections between endpoints.
          globalInstance.bind("connection", function(connInfo, originalEvent) {
            init(connInfo.connection);
            newConnectionCallback();
          });

          // Make all the window DOM elements draggable.
          globalInstance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {
            grid: [20, 20]
          });

          // Listen for clicks on connections, and offer to delete connections on
          // click.
          globalInstance.bind("click", function(conn, originalEvent) {
            if (conn !== undefined) {
              globalInstance.detach(conn);
            }
            newConnectionCallback();
          });
        });

        // Tell jsPlumb to re-render the flowchart.
        jsPlumb.fire("jsPlumbDemoLoaded", this.instance);
    };

    // Method to add new components to flowchart. Note that in this method,
    // component is actually a reference to the array element in designerController's
    // $scope.flowchart.activeComponents.
    this.syncStructures = function(activeComponents) {
      localActiveComponents = activeComponents;
      this.updateFlowchart();
    };

    // Method that returns all flowchart components and connections as a directed
    // graph.
    this.saveFlowchartData = function () {
        var nodes = [];
        var edges = [];

        // Iterate over all endpoints.
        globalInstance.selectEndpoints().each(function (endpoint) {
          var endpointNode;

          // Go through all nodes, see if they belong to this endpoint.
          for (let node of nodes) {
            if (node.name == endpoint.element.id) {
              endpointNode = node;
            }
          }
          // Add the node to the list of nodes. If it's already in the list of
          // nodes, add the endpoint to the appropriate list of endpoints.
          if (endpointNode !== undefined) {
            if (endpoint.isTarget) {
              endpointNode.inputs.push(endpoint.id);
            } else {
              endpointNode.outputs.push(endpoint.id);
            }
          } else {
            var node = { name: endpoint.element.id };
            node.inputs = [];
            node.outputs = [];
            if (endpoint.isTarget) {
              node.inputs.push(endpoint.id);
            } else {
              node.outputs.push(endpoint.id);
            }
            nodes.push(node);
          }
        });

        // Add all connections to an array of edges.
        globalInstance.getConnections().forEach(function (connection) {
          edges.push({
            from: connection.endpoints[0].id,
            to: connection.endpoints[1].id,
            fromUUID: connection.endpoints[0].anchor.elementId+connection.endpoints[0].anchor.type,
            toUUID: connection.endpoints[1].anchor.elementId+connection.endpoints[1].anchor.type
          });
          console.log({
            from: connection.endpoints[0].id,
            to: connection.endpoints[1].id,
            fromUUID: connection.endpoints[0].anchor.elementId+connection.endpoints[0].anchor.type,
            toUUID: connection.endpoints[1].anchor.elementId+connection.endpoints[1].anchor.type
          });
        });
        return { nodes: nodes, edges: edges };
      };
      var saveFlowchartData = this.saveFlowchartData;

      // Initialize jsPlumb.
      globalInstance = setup();
      this.updateFlowchart();
  });
