
//	Основи на Компютърната Графика
//	Модел 07451 - Цветово пространство YIQ
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M07451 = function M07451(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	var geom = new THREE.BoxGeometry(1,1,1,6,6,6);
	this.cube = new THREE.Mesh(
		geom,
		new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors}) );
	this.cube.scale.set(4,4,4);
	var faceIndices = ['a','b','c'];
	geom.faces.forEach(function(face)
		{
		  for (var i = 0; i < 3; i++)
		  {
			var vertexIndex = face[faceIndices[i]];
			var vertex = geom.vertices[vertexIndex];
			
			var cy = vertex.x + 0.5;
			var ci = vertex.y/0.5*0.5957;
			var cq = vertex.z/0.5*0.5226;

			var color = new THREE.Color(
			  cy+0.956*ci+0.621*cq,
			  cy-0.272*ci-0.647*cq,
			  cy-1.106*ci+1.703*cq
			);
			face.vertexColors[i] = color;
		  }
		});		
	
	// цветови оси
	this.axisY = new MEIRO.Vector(new THREE.Vector3(1,0,0),1,'black');
	this.axisY.position.set(2,0,0);
	this.axisI = new MEIRO.Vector(new THREE.Vector3(0,1,0),1,new THREE.Color(0.57,0,0));
	this.axisI.position.set(-1.97,2,0);
	this.axisQ = new MEIRO.Vector(new THREE.Vector3(0,0,1),1,new THREE.Color(0.32,0,0.89));
	this.axisQ.position.set(-1.97,0,2);

	// надписи
	this.labelY = new MEIRO.Label('Y',0.4,-0.1,0.25,0);
	this.labelY.material = new THREE.MeshPhongMaterial({color:new THREE.Color(0.57/2,0/2,0/2)});
	this.labelY.position.set(3,0,0);
	this.labelI = new MEIRO.Label('I',0.4,-0.08,0.1,0);
	this.labelI.material = new THREE.MeshPhongMaterial({color:'black'});
	this.labelI.position.set(-2,3,0);
	this.labelQ = new MEIRO.Label('Q',0.4,-0.1,0.25,0);
	this.labelQ.material = new THREE.MeshPhongMaterial({color:new THREE.Color(0.32/2,0/2,0.89/2)});
	this.labelQ.position.set(-2,0,3);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЦВЕТОВИ ОСИ', 'images/show.hide.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.axisQ,this.axisI,this.axisY,this.labelQ,this.labelI,this.labelY);
}

MEIRO.Models.M07451.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07451.DIST = {MIN:8, MAX:20, HEIGHT:0};
MEIRO.Models.M07451.POS = {DIST:13, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07451.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07451.prototype.onAnimate = function(time)
{
	this.labelQ.rotateLabel();
	this.labelI.rotateLabel();
	this.labelY.rotateLabel();
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07451.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Цветово пространство YIQ</h1>';

	s += '<p>Това цветово пространство се изполва при аналогова NTSC телевизия. Компонентите са яркост <em>Y</em>, фаза <em>I</em> и квадратура <em>Q</em></p>'; 
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07451.prototype.onToggle = function(element)
{
	var v = !this.axisQ.visible;
	this.axisQ.visible = v;
	this.axisI.visible = v;
	this.axisY.visible = v;
	this.labelQ.visible = v;
	this.labelI.visible = v;
	this.labelY.visible = v;
	reanimate();
}