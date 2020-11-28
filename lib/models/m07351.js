
//	Основи на Компютърната Графика
//	Модел 07351 - Цветово пространство RGB
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M07351 = function M07351(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	this.cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1));
	this.cube.scale.set(4,4,4);
	this.cube.material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
	var geom = this.cube.geometry;
	var faceIndices = ['a','b','c'];
	geom.faces.forEach(function(face)
		{
		  for (var i = 0; i < 3; i++)
		  {
			var vertexIndex = face[faceIndices[i]];
			var vertex = geom.vertices[vertexIndex];
			var color = new THREE.Color(
			  vertex.x + 0.5,
			  vertex.y + 0.5,
			  vertex.z + 0.5
			);
			face.vertexColors[i] = color;
		  }
		});		
	
	// цветови оси
	this.axisR = new MEIRO.Vector(new THREE.Vector3(1,0,0),1,'red');
	this.axisR.position.set(2,-1.97,-1.97);
	this.axisG = new MEIRO.Vector(new THREE.Vector3(0,1,0),1,'lime');
	this.axisG.position.set(-1.97,2,-1.97);
	this.axisB = new MEIRO.Vector(new THREE.Vector3(0,0,1),1,'blue');
	this.axisB.position.set(-1.97,-1.97,2);

	// надписи
	this.labelR = new MEIRO.Label('R',0.4,-0.1,0.25,0);
	this.labelR.material = new THREE.MeshPhongMaterial({color:'darkred'});
	this.labelR.position.set(3,-2,-2);
	this.labelG = new MEIRO.Label('G',0.4,-0.15,0.1,0);
	this.labelG.material = new THREE.MeshPhongMaterial({color:'green'});
	this.labelG.position.set(-2,3,-2);
	this.labelB = new MEIRO.Label('B',0.4,-0.1,0.25,0);
	this.labelB.material = new THREE.MeshPhongMaterial({color:'navy'});
	this.labelB.position.set(-2,-2,3);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЦВЕТОВИ ОСИ', 'images/show.hide.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.axisR,this.axisG,this.axisB,this.labelR,this.labelG,this.labelB);
}

MEIRO.Models.M07351.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07351.DIST = {MIN:8, MAX:20, HEIGHT:0};
MEIRO.Models.M07351.POS = {DIST:13, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07351.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07351.prototype.onAnimate = function(time)
{
	this.labelR.rotateLabel();
	this.labelG.rotateLabel();
	this.labelB.rotateLabel();
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07351.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Цветово пространство RGB</h1>';

	s += '<p>Това е начин на представяне на цветовете като куб с цветни оси &ndash; червена <em>R</em>, зелена <em>G</em> и синя <em>B</em>. Координатите на точка в този куб съответстват на конкретни стойности на трите цвята.</p>'; 
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07351.prototype.onToggle = function(element)
{
	var v = !this.axisR.visible;
	this.axisR.visible = v;
	this.axisG.visible = v;
	this.axisB.visible = v;
	this.labelR.visible = v;
	this.labelG.visible = v;
	this.labelB.visible = v;
	reanimate();
}