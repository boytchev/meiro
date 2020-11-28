
//	Основи на Компютърната Графика
//	Модел 07411 - Цветово пространство CMY(K)
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M07411 = function M07411(room)
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
			  -vertex.x + 0.5,
			  -vertex.y + 0.5,
			  -vertex.z + 0.5
			);
			face.vertexColors[i] = color;
		  }
		});		
	
	// цветови оси
	this.axisC = new MEIRO.Vector(new THREE.Vector3(1,0,0),1,'cyan');
	this.axisC.position.set(2,-1.97,-1.97);
	this.axisM = new MEIRO.Vector(new THREE.Vector3(0,1,0),1,'magenta');
	this.axisM.position.set(-1.97,2,-1.97);
	this.axisY = new MEIRO.Vector(new THREE.Vector3(0,0,1),1,'yellow');
	this.axisY.position.set(-1.97,-1.97,2);

	// надписи
	this.labelC = new MEIRO.Label('C',0.4,-0.1,0.25,0);
	this.labelC.material = new THREE.MeshPhongMaterial({color:'darkcyan'});
	this.labelC.position.set(3,-2,-2);
	this.labelM = new MEIRO.Label('M',0.4,-0.15,0.1,0);
	this.labelM.material = new THREE.MeshPhongMaterial({color:'darkmagenta'});
	this.labelM.position.set(-2,3,-2);
	this.labelY = new MEIRO.Label('Y',0.4,-0.1,0.25,0);
	this.labelY.material = new THREE.MeshPhongMaterial({color:'darkorange'});
	this.labelY.position.set(-2,-2,3);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЦВЕТОВИ ОСИ', 'images/show.hide.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.axisC,this.axisM,this.axisY,this.labelC,this.labelM,this.labelY);
}

MEIRO.Models.M07411.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07411.DIST = {MIN:8, MAX:20, HEIGHT:0};
MEIRO.Models.M07411.POS = {DIST:13, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07411.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07411.prototype.onAnimate = function(time)
{
	this.labelC.rotateLabel();
	this.labelM.rotateLabel();
	this.labelY.rotateLabel();
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07411.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Цветово пространство CMY(K)</h1>';

	s += '<p>Това е начин на представяне на цветовете като куб с цветни оси &ndash; светлосиня <em>C</em>, пурпурна <em>M</em> и жълта <em>Y</em>. При печатане се добавя и четвърти цвят &ndash; черен <em>K</em> за постигане на пл-плътен цвят. Координатите на точка в този куб съответстват на конкретни стойности на трите цвята.</p>'; 
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07411.prototype.onToggle = function(element)
{
	var v = !this.axisC.visible;
	this.axisC.visible = v;
	this.axisM.visible = v;
	this.axisY.visible = v;
	this.labelC.visible = v;
	this.labelM.visible = v;
	this.labelY.visible = v;
	reanimate();
}