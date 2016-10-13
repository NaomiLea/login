// Global variable declarations
var Nodes, Lines, radius, stroke, connectLines, secondCounter, adder, globDragPoint, text, mouseDownholder, coulomb, coulomb2, repulsion, friction, debug, counter, fps;
fps = 60;
Nodes = [];
Lines = [];
radius = 65;
stroke = 15;
mouseDownHolder = null;
coulomb = false;
coulomb2 = false;
repulsion = false;
friction = true;
debug = false;







///  Styles 
// Line style
var lineStyle = {
	strokeWidth: stroke,
	fillColor: '#446CB3',
	strokeColor: '#E4F1FE',
	strokeCap: 'round'
}

// Node style
var nodeStyle = lineStyle;
// nodeStyle.strokeWidth = 10;

// Style for highlighted node
var highlightStyle = {
	fillColor: '#59ABE3'
}




//////////// Object constructors ////////////

/// Node object constructor
function Node(pos) {

	// Assigns random position if none specified
	// this.nextPoint = pos ? pos : randPoint(radius, Nodes); // still including it for when something depeends on it being initialised
	var position = pos ? pos : randPoint(radius, Nodes);

	this.velocity = new Point(0, 0);


	// Creates the Path
	// this.node = new Path.Circle(this.nextPoint, radius);
	this.node = new Path.Circle(position, radius);

	this.node.style = nodeStyle;

	this.label = new PointText({
		position: position,
		content: 'Point ' + Math.floor(Math.random() * 1000),
		fillColor: 'white'
	});
	this.label.position = position;

	this.group = new Group([this.node, this.label]);

	// this.nodeID = nodeID; // Needs to be assigned
	this.selected = false; // Gets set to true for deleting this Node from the Nodes array
	this.newNode = false;
	this.lines = []; // Where all connecting lines will be referenced


	// Returns array with all Nodes that this Node is connected to
	this.nodes = function() {
		var nodesArray = [];
		for (var i = 0; i < this.lines.length; i++) {
			for (var j = 0; j < this.lines[i].nodes.length; j++) {
				if (this.lines[i].nodes[j] !== this) {
					nodesArray.push(this.lines[i].nodes[j]);
				}
			}
		}
		return nodesArray;
	}

	// Returns the opposing force to input param
	this.friction = function(velocity) {
		// console.log(velocity);
		var fricForce = -velocity.normalize() / 10;
		console.log(fricForce);
		return fricForce;
	}

	this.coulVec = function() {
		var here = this.node.position;
		var nodes = this.nodes();
		var nodeLocs = [],
			vectors = [],
			norms = [],
			lines = [];
		var totalLength = 0;

		// Creates normalized vectors for all the Node's lines
		for (var i = 0; i < nodes.length; i++) {
			nodeLocs.push(nodes[i].node.position); // Node positions
			vectors.push(nodeLocs[i] - here); // Vectors: direction and length to nodes[] from this one
			norms.push(vectors[i].normalize(100)); // Normalizing vector lengths 
			// norms.push(vectors[i]);
			// totalLength += vectors[i].length;
			// lines.push(new Path.Line(here, here + norms[i])) // Drawing lines from here to here plus vectors
			// lines[i].style = {
			// 	strokeWidth: 1,
			// 	strokeColor: 'black'
			// }
		}

		// 
		var direction = new Point(0, 0);
		for (var i = 0; i < vectors.length; i++) {
			direction += vectors[i];
		}
		direction /= vectors.length;

		// var avgLinePath = new Path.Line(this.node.position, this.node.position + direction);
		// avgLinePath.style = {
		// 	strokeWidth: 1,
		// 	strokeColor: 'black'
		// }
		return direction;
	}

	this.vecLine = function() {
		var line = new Path.Line(this.node.position, this.node.position + this.coulVec());
		line.style = {
			strokeWidth: 1,
			strokeColor: 'black'
		}

	}


	// Makes all nodes around this one starfish around this node
	this.coulVec2 = function() {
		var nodes = this.nodes();
		var paths = [];
		var vector;
		if (nodes.length > 1) {

			for (var i = 0; i < nodes.length; i++) {
				if (nodes[i].dragging !== true) {
					/*// vector = this.node.position - nodes[i].node.position;
					// vector = vector.normalize(100);

					// paths.push(new Path.Line(nodes[i].node.position, nodes[i].node.position + vector));
					// paths[i].style = {
					// 	strokeColor: 'black',
					// 	strokeWidth: 2
					// }*/


					// nodes[i].nextPoint = rot(nodes[i].nextPoint, this.group.position, .2);


					nodes[i].nextPoint += -(this.coulVec() / nodes.length) / 10;



				}
			}
		}
	}

	this.repulsion = function() {
		var opposite, magn, direction = new Point(0, 0);

		for (var i = 0; i < Nodes.length; i++) {
			if (Nodes[i] !== this) {
				var hereToThere = Nodes[i].group.position - this.group.position;

				magn = hereToThere.length;
				console.log(magn);
				if (magn < 500) {
					direction = -hereToThere * (500 - magn);

				}

				// y = -3x - 50
				return direction / 500;

			}
		}

	}



	this.move = function() {
		// console.log(this.velocity.length);

		if (!this.dragging) {
			// if (coulomb2) {
			// 	this.coulVec2();
			// }
			if (coulomb) {
				this.velocity += this.coulVec();
			}
			if (repulsion) {
				// this.nextPoint += this.repulsion();
			}
			if (friction) {
				if (this.velocity.length > 0.01) {
					this.velocity += this.friction(this.velocity);
				} else {
					this.velocity = new Point(0, 0);
				}
			}
			console.log(this.velocity);
			this.group.position += this.velocity;
		} else {
			this.velocity = new Point(0, 0);
		}


		// Actually makes Node move to its new vector
		// this.group.position = this.nextPoint;


	}

	// Drag and drop capabilities 
	this.dragging = false;
	this.linking = false;

	this.del = function() {
		console.log("Node.del() triggered");
		this.selected = true; // So that it can be identified from outside

		// Removes all lines associated with this Node
		for (var i = this.lines.length - 1; i >= 0; i--) {
			this.lines[i].del();
		}

		// loops through array and deletes this Node based on its being 'selected'
		for (var i = 0; i < Nodes.length; i++) {
			if (Nodes[i].selected === true) {
				Nodes[i].group.remove();

				Nodes.splice(i, 1);
			}
		}
	}

	// this.dragPoint = null;
	this.mouseDownEvent = function(event) {
		mouseDownHolder = this; // Assigns this Node object to the holder
		this.group.bringToFront();

		var middleClicked = event.point.isClose(this.group.position, radius - stroke / 2);

		if (this.newNode === true || middleClicked) {
			this.dragging = true;
			if (!this.newNode) this.node.style = highlightStyle;
			this.dragPoint = this.group.position - event.point;
		} else {
			Lines.push(new Line(this));
			Lines[Lines.length - 1].mouseDownEvent(event);
		}
		console.log("This Node's connected Nodes: ", this.nodes());
		// console.log("this.coulVec()", this.coulVec());
		this.coulVec();
		// console.log(this.lines);
		if (debug) flashNodeLines(this);
		// this.send("Clicky! " + counter);
	}

	this.mouseDragEvent = function(event) {
		if (this.dragging) {
			this.group.position = this.dragPoint + event.point;
			// this.group.position = this.dragPoint + event.point;
			// this.group.position = event.point;
		} else {
			Lines[Lines.length - 1].mouseDragEvent(event);
		}
	}

	this.mouseUpEvent = function(event) {
		if (this.dragging) {
			// this.nextPoint = this.dragPoint + event.point;
			this.node.style = nodeStyle;
			this.dragging = false;
		}

		mouseDownHolder = null; // Clear the global variable from this
	}


	/// Technical mouse events. They only call the better defined functions above.
	this.group.onMouseDown = function(event) {
		console.log("Testing onMouseDown");
		this.mouseDownEvent(event);
	}.bind(this);

	this.group.onMouseDrag = function(event) {
		this.mouseDragEvent(event);
	}.bind(this);

	// Node delete
	this.node.onDoubleClick = function(event) {};
	this.label.onDoubleClick = function(event) {};
	this.group.onDoubleClick = function(event) {
		console.log("Testing onDoubleClick");
		if (event.point.isClose(this.group.position, radius - stroke / 2)) {
			// console.log("Deleting Node...");
			this.del();
		}
	}.bind(this);

}





//////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// Line constructor! 
function Line(node1, node2) {
	// console.log("Lines.length", Lines.length);


	this.nodes = [node1]; // Assigns first Node to nodes array
	node1.lines.push(this); // Adds this line to first Node's lines array

	if (node2) { // If was given a 2nd Node as input parameter

		this.nodes.push(node2); // Assigns 2nd Node to nodes array
		node2.lines.push(this); // Pushes itself into the Node's lines array

		// Draws the actual line path
		this.line = new Path.Line(node1.group.position, node2.group.position);

	} else {
		// Draws the actual line path
		this.line = new Path.Line(node1.group.position, node1.group.position);
	}

	// Line style stuff
	this.line.style = lineStyle;
	this.line.sendToBack();







	// Handle for selecting this Line from outside when deleting
	this.selected = false;

	// Deletes this Line and all references to it

	/*
	For each Node of this Line:
		Each of its lines:
			delete the line if it is selected
	Remove the line path
	Delete the Line object from Lines array

	*/


	this.del = function() {
		console.log("Line deleted.");
		this.selected = true;
		var newLinesHolder = [];

		// For each nodes of this Line
		var nodeNum = this.nodes.length;
		for (var i = 0; i < nodeNum; i++) {
			newLinesHolder.length = 0;

			// For every line of that node
			var lineNum = this.nodes[i].lines.length;
			for (var j = 0; j < lineNum; j++) {
				// Delete the line from array if it's selected
				if (this.nodes[i].lines[j].selected === false) {
					// this.nodes[i].lines.splice(j, 1);
					newLinesHolder.push(this.nodes[i].lines[j]);
				}
			}
			// IT PASSES BY REFERENCE NOT BY FUCKING VALUE
			this.nodes[i].lines.length = 0;
			this.nodes[i].lines = newLinesHolder.slice();
			newLinesHolder.length = 0;
		}

		// Remove the line path
		// console.log("this.line", this.line);
		this.line.remove();

		// Delete the Line object from Lines array
		var LineNum = Lines.length;
		for (var i = 0; i < LineNum; i++) {
			if (Lines[i].selected === false) {
				// Lines.splice(i, 1);
				newLinesHolder.push(Lines[i]);
			}
		}
		Lines.length = 0;
		for (var i = 0; i < newLinesHolder.length; i++) {
			Lines.push(newLinesHolder[i]);
		}
		Lines = newLinesHolder.slice();
		newLinesHolder.length = 0;
		// console.log("Lines", Lines);
	}

	// Updates the Line's ends' location
	this.move = function() {
		this.line.firstSegment.point = this.nodes[0].group.position; // First Line end always follows the Node it's attached to
		if (this.nodes.length > 1) { // Only updates 2nd end's position if it's attached to a Node
			this.line.lastSegment.point = this.nodes[1].group.position;
		}
	}

	/// Mouse events
	this.mouseDownEvent = function(event) {
		mouseDownHolder = this; // Assigns this Line object to the global holder
		if (this.nodes.length > 1) {
			this.line.lastSegment.point = event.point;
		}
		if (debug) flashLine(this);
	}

	this.mouseDragEvent = function(event) {
		this.line.lastSegment.point = event.point;
	}

	this.mouseUpEvent = function(event) {
		var secondNode = null,
			leastDistance = 10000,
			nodesAlreadyConnected = false;
		// Runs through each Node to check which is closest
		for (var i = 0; i < Nodes.length; i++) {

			var currNodeDistance = event.point.getDistance(Nodes[i].group.position);

			if (currNodeDistance < leastDistance) {
				leastDistance = currNodeDistance;
				secondNode = Nodes[i];
			}
		}

		// Checks if the Line's two nodes are already connected
		if (this.nodes.length < 2) {
			var firstNodeNodes = this.nodes[0].nodes();
			// console.log("This Line's first Node's connections are", firstNodeNodes);
			for (var i = 0; i < firstNodeNodes.length; i++) {
				if (firstNodeNodes[i] === secondNode) {
					console.log("Already connected! :(");
					nodesAlreadyConnected = true;
				}
			}



			if (leastDistance < radius && !nodesAlreadyConnected && secondNode !== this.nodes[0]) { // Checks if closest Node is within 1 radius of mouseUp AND if nodes are not connected yet by another Line
				/// Connects to second Node
				this.nodes.push(secondNode);
				secondNode.lines.push(this);
				this.line.lastSegment.point = this.nodes[1].group.position;
				// console.log("Line close enough to a Node :)");
				console.log("New Node connection!");
			} else { // if Line is too far, releasing the mouse button deletes the Line
				this.del();
				if (!nodesAlreadyConnected) {
					console.log("Line not close enough to a Node. try connecting again.");
				}
			}

		}
		mouseDownHolder = null;
	}


	/// Technical mouse events. They only call the better defined functions above.
	this.line.onMouseDown = function(event) {
		this.mouseDownEvent(event);
	}.bind(this);

	this.line.onMouseDrag = function(event) {
		this.mouseDragEvent(event);
	}.bind(this);

	this.line.onDoubleClick = function(event) {
		this.del();
	}.bind(this);

}





function Adder() {
	var margin = 100;
	// Creates the circle
	this.node = new Path.Circle(new Point(view.bounds.width - margin, view.bounds.height - margin), radius * 1);
	this.node.style = nodeStyle;
	this.node.fillColor = '#019851';
	this.node.strokeWidth /= 1.5;

	var dragPoint; // For dragging

	this.adderPoint = function() {

		this.node.position = new Point(view.bounds.width - margin, view.bounds.height - margin);
	}.bind(this);

	var thisNode = null; // To be assigned to the new Node to be created

	this.node.onMouseDown = function(event) {

		globals.newNode(this.node.position); // Creates new Node
		thisNode = Nodes[Nodes.length - 1]; // Selects new Node
		thisNode.newNode = true;

		thisNode.mouseDownEvent(event);

		mouseDownHolder = this; // Assigns the Adder to the holder

		this.node.bringToFront();
	}.bind(this);

	this.node.onMouseDrag = function(event) {

		thisNode.mouseDragEvent(event);

	}.bind(this);


	this.mouseUpEvent = function(event) {
		thisNode.mouseUpEvent(event); // Activates the mouseUpEvent for the Node last created
		// Checks if Node is too close to Adder
		if (thisNode.node.position.isClose(this.node.position, radius * 2 + nodeStyle.strokeWidth * 1.5)) {
			thisNode.del(); // Deletes Node
			console.log("Was too close! Drag it further out.");
		} else {
			console.log("Was far enough. Enjoy your new Node.");
			thisNode.newNode = false; // Node is not new anymore
		}
		mouseDownHolder = null; // Clear the global variable from this
	}
}
////////// End of object constructors ////////////






//////////////////////// Other functions


// Global functions: funcs that need to be accesible from the main JS context
window.globals = {
	// Initialiser function
	init: function() {
		project.activeLayer.removeChildren();
		counter = 0;

		adder = new Adder;

		Nodes = [];
		Lines = [];

		// var nodeNum = 1;

		for (var i = 0; i < nodeNum; i++) {
			Nodes[i] = new Node(randPoint(radius, Nodes), i);
			Nodes[i].velocity += new Point(0, 5);
			Nodes[i].velocity.angle = Nodes[i].velocity.angle + Math.random() * 360;

		}
		for (var i = 0; i < lineConnections.length; i++) {
			Lines[i] = new Line(Nodes[lineConnections[i].from], Nodes[lineConnections[i].to]);
		}

	},
	// Create a new Node
	newNode: function(loc) {
		Nodes.push(new Node(loc));
		console.log("Nodes.length: " + Nodes.length);
	}
}



// Returns random integer under max parameter
function randInt(max) {
	return Math.floor(Math.random() * max + 1)
}

// Returns random point whilst avoiding all nodes in the list with specified radius
function randPoint(radius, nodesList) {
	var point;
	var conflict;
	var bounds = view.bounds;
	var boxMargin = radius * 2;
	var frame = new Rectangle(0, 0, bounds.width, bounds.height);
	var newFrame = frame.scale(0.8);

	do {
		conflict = false;
		point = Point.random() * new Rectangle(newFrame.width, newFrame.height) + newFrame.point;
		for (var i = 0; i < Nodes.length; i++) {
			if (point.isClose(Nodes[i].group.position, radius * 3)) {
				conflict = true;
			}
		}
		// console.log("Conflict is " + conflict);
	} while (conflict == true);

	return point;
}

// function absVector(vector) {
// 	var newX = Math.sqrt(vector.x * vector.x);
// 	var newY = Math.sqrt(vector.y * vector.y);
// 	return new Point(newX, newY);
// }

// Makes a line flash for a second
function flashLine(L) {
	// console.log(L);
	L.line.style.strokeColor = 'yellow';
	setTimeout(function() {
		L.line.style = lineStyle;
	}, 1000);
}

// Makes all lines connected to a node light up
function flashNodeLines(node) {
	for (var i = 0; i < node.lines.length; i++) {
		flashLine(node.lines[i]);
	}
}


// Makes rotatee rotate around the origin by given number degrees each frame
function rot(rotatee, origin, degrees) {
	return rotatee = ((rotatee - origin).rotate(degrees) + origin);
}




/////////////////////////// Procedures / Main

globals.init();



// var testNode = new Path.Circle(view.center, radius);
// testNode.style = nodeStyle;
// testNode.bringToFront();



////////////////////////////////////////////////
///////////// Frame & global events ////////////
////////////////////////////////////////////////
function onFrame(event) {
	counter++;
	if (counter % (60 / fps) === 0) {
		for (var i = 0; i < Nodes.length; i++) {
			Nodes[i].move();
		}
		for (var i = 0; i < Lines.length; i++) {
			Lines[i].move();
		}
		adder.node.bringToFront();
		// console.log("mouseDownHolder:", mouseDownHolder);
		// testNode.position += 0.3;
	}

}

// Resize viewport event
function onResize(event) {
	adder.adderPoint();
}

// Universal onMouseUp event - which executes selected object's individually defined mouseUpEvent function.
function onMouseUp(event) {
	// console.log("Mouse up on:", mouseDownHolder);
	if (mouseDownHolder !== null) {
		mouseDownHolder.mouseUpEvent(event);
	}
}


// All items still have their own onMouseDown event, but all onMouseUp events that apply when moved away from the object are taken out and merged into one main onMouseUp event function.
// the OMU function stores the object that triggered the OMD function and, along with its current position will execute the desired task, depending on what was intended by its movement.


// Forces needed: 
//  - node repulsion so nodes don't get too close
//  - tension, so lines don't get too long
//  - opposing line repulsion, so that lines of a node will seek to put as much radial size between them and the next one. I.e. the starfish effect. Will ensure that topographic circle displays as actual circle
//  - central gravitation, so nodes don't fly away into the distance
//  - friction maybe? so motion dies down after a while



/*
Design spec:
  - You can add network elements by clicking an 'add' button
  - All balloons will be linkable to each other by dragging lines from one to the other
  - The balloons will rearrange to minimise length of connection lines, whilst maintaining network topography
  - However there will be a minimum length the connection line must be, so that they don't all collapse on one another
  - Similarly the balloons cannot overlap one another, even if not linked
  - Balloons will sway somewhat around their locations, connections permitting

  Potentials:
  - Somehow dragging a balloon will make it more likely to stay in the dropped area, so there is some stickiness

  */
