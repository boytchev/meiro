
//	Основи на Компютърната Графика
//	Модел 07471 - Цветово пространство HSL
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M07471 = function M07471(room)
{
	MEIRO.Model.apply(this, arguments);

	// диск
	this.dist = 0;
	this.disk = new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,48,15));
	this.disk.scale.set(2,4,2);
	this.colorizeHSV(this.disk);
	
	// цветови оси
	this.axisL = new MEIRO.Vector(new THREE.Vector3(0,1,0),4,'black');
	this.axisL.position.set(2,-2,0);
	this.axisS = new MEIRO.Vector(new THREE.Vector3(1,0,0),2,'black');
	this.axisS.position.set(0,2,0);
	this.axisH = new THREE.Mesh(new THREE.TorusGeometry(2,0.03,6,20,Math.PI/2), MEIRO.PRIMITIVE.STYLE.AXIS);
	this.axisH.rotation.x = -Math.PI/2;
	this.axisH.position.set(0,2,0);
	this.arrowH = new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.ARROW, MEIRO.PRIMITIVE.STYLE.AXIS);
	this.arrowH.position.set(0,2,-2);
	this.arrowH.rotation.set(0,0,Math.PI/2);


	// надписи
	this.labelL = new MEIRO.Label('L',0.4,-0.1,0.25,0);
	this.labelL.material = new THREE.MeshPhongMaterial({color:'black'});
	this.labelL.position.set(2.35,0,0);
	this.labelS = new MEIRO.Label('S',0.4,-0.1,0.25,0);
	this.labelS.material = new THREE.MeshPhongMaterial({color:'black'});
	this.labelS.position.set(1,2,0);
	this.labelH = new MEIRO.Label('H',0.4,-0.1,0.25,0);
	this.labelH.material = new THREE.MeshPhongMaterial({color:'black'});
	this.labelH.position.set(1.56,2,-1.56);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЦВЕТОВИ ОСИ', 'images/show.hide.png');
	this.toggle.hide();
	this.onToggle();
	
	// сглобяване на целия модел
	this.image.add(this.disk,this.axisL,this.axisH,this.arrowH,this.labelL,this.axisS,this.labelS,this.labelH);
}

MEIRO.Models.M07471.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07471.DIST = {MIN:8, MAX:20, HEIGHT:0};
MEIRO.Models.M07471.POS = {DIST:13, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07471.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07471.prototype.onAnimate = function(time)
{
	this.labelL.rotateLabel();
	this.labelS.rotateLabel();
	this.labelH.rotateLabel();

//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07471.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Цветово пространство HSL</h1>';

	s += '<p>Това цветово пространство улеснява хората в избор на цвят, понеже той се дефинира с основните си визуални характеристики &ndash; цветност <em>H</em>, наситеност <em>S</em> и светлост <em>L</em>.</p>'; 
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07471.prototype.onToggle = function(element)
{
	var v = !this.axisL.visible;
	this.axisL.visible = v;
	this.labelL.visible = v;
	this.axisS.visible = v;
	this.labelS.visible = v;
	this.axisH.visible = v;
	this.arrowH.visible = v;
	this.labelH.visible = v;
	reanimate();
}



MEIRO.Models.M07471.prototype.colorizeHSV = function (object)
{
	object.material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side:THREE.DoubleSide});

	var faceIndices = ['a','b','c'];
	var geometry = object.geometry;
	var vec = new THREE.Vector2();
	
	geometry.faces.forEach(
		function(face)
		{
			for (var i = 0; i < 3; i++)
			{
				var vertexIndex = face[faceIndices[i]];
				var vertex = geometry.vertices[vertexIndex];
				vec.set(vertex.x,vertex.z);
				
				var h = -vec.angle();
				var s = Math.sqrt(vertex.x*vertex.x+vertex.z*vertex.z);
				var l = vertex.y+0.49;
				
				color = new THREE.Color().setHSL(h/Math.PI/2,s,l);
				face.vertexColors[i] = color;
			}
		}
	);		
}