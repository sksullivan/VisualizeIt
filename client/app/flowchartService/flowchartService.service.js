'use strict';

angular.module('vizualizeItApp')
  .service('flowchartService', function() {
    var componentCount = 0;
    var componentDeletionCallback = null;
    var globalInstance;
    var setup = function() {
      var instance = jsPlumb.getInstance({
        // default drag options
        DragOptions: {
          cursor: 'pointer',
          zIndex: 2000
        },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
          ["Arrow", {
            location: 1
          }],
          ["Label", {
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
          strokeStyle: "red",
          lineWidth: 4
        },
        hoverPaintStyle: {
          strokeStyle: "blue"
        },
        overlays: [
          "Arrow"
        ]
      };
      instance.registerConnectionType("basic", basicType);
      return instance;
    };

    globalInstance = setup();

    this.registerComponentDeletionCallback = function (callback) {
      componentDeletionCallback = callback;
    };
    this.updateFlowchart = function () {
      // this is the paint style for the connecting lines..
      var connectorPaintStyle = {
          lineWidth: 4,
          strokeStyle: "#61B7CF",
          joinstyle: "round",
          outlineColor: "white",
          outlineWidth: 2
        },
        // .. and this is the hover style.
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
        // the definition of source endpoints (the small blue ones)
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
        // the definition of target endpoints (will appear when the user drags a connection)
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
        },
        init = function(connection) {
          connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
        };

        var addEndpoints = function (toId, sourceAnchors, targetAnchors) {
            for (var i = 0; i < sourceAnchors.length; i++) {
                var sourceUUID = toId + sourceAnchors[i];
                globalInstance.addEndpoint("flowchart" + toId, sourceEndpoint, {
                    anchor: sourceAnchors[i], uuid: sourceUUID
                });
            }
            for (var j = 0; j < targetAnchors.length; j++) {
                var targetUUID = toId + targetAnchors[j];
                globalInstance.addEndpoint("flowchart" + toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
            }
        };

        globalInstance.batch(function() {
          globalInstance.reset();
          for (var i = 1; i < componentCount + 1; i++) {
            addEndpoints("Window" + i, ["RightMiddle"], ["LeftMiddle"]);
            document.getElementById("flowchartWindow"+i).addEventListener("dblclick", function (e) {
              globalInstance.remove(e.srcElement);
              e.stopPropagation();
              componentDeletionCallback(i-2);
              componentCount--;
            });
          }
          addEndpoints("Window0", [], ["LeftMiddle"]);
          /*globalInstance.selectEndpoints().each(function(endpoint) {
            console.log(endpoint);
          });*/

          // listen for new connections; initialise them the same way we initialise the connections at startup.
          globalInstance.bind("connection", function(connInfo, originalEvent) {
            init(connInfo.connection);
          });

          // make all the window divs draggable
          globalInstance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), {
            grid: [20, 20]
          });

          //
          // listen for clicks on connections, and offer to delete connections on click.
          //
          globalInstance.bind("click", function(conn, originalEvent) {
            if (conn !== undefined) {
              if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")) {
                globalInstance.detach(conn);
              }
            }
          });


        });

        jsPlumb.fire("jsPlumbDemoLoaded", this.instance);
    };

    this.addComponent = function(component) {
      componentCount++;
      this.updateFlowchart();
      component.domElementId = "flowchartWindow"+componentCount;
    };

    this.saveFlowchartData = function () {
        var nodes = [];
        var edges = [];
        globalInstance.selectEndpoints().each(function (endpoint) {
          var endpointNode;
          for (let node of nodes) {
            if (node.name == endpoint.element.id) {
              endpointNode = node;
            }
          }
          // if endpoint's node is in there already
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
        globalInstance.getConnections().forEach(function (connection) {
            edges.push({ from: connection.endpoints[0].id, to: connection.endpoints[1].id });
        });
        return { nodes: nodes, edges: edges };
      };
  });
