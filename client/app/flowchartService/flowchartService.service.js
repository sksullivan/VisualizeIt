'use strict';

angular.module('vizualizeItApp')
  .service('flowchartService', function() {
    var elementCount = 0;
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

    jsPlumb.ready(function () {

    });

    globalInstance = setup();

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

          for (var i = 1; i < elementCount + 1; i++) {
            addEndpoints("Window" + i, ["RightMiddle"], ["LeftMiddle"]);
          }
          addEndpoints("Window0", [], ["LeftMiddle"]);
          globalInstance.selectEndpoints().each(function(endpoint) {
            console.log(endpoint);
          });

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
            // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
            //   instance.detach(conn);
            conn.toggleType("basic");
          });
        });

        jsPlumb.fire("jsPlumbDemoLoaded", this.instance);
    };

    this.addComponent = function(domElement) {
      elementCount++;
      this.updateFlowchart();
    };

    this.saveFlowchartData = function () {
      globalInstance.selectEndpoints().each(function (endpoint) {
        console.log(endpoint.id);
      });
    };
  });
