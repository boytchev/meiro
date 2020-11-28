
//	Основи на Компютърната Графика
//	Модел 07452 - Цветово пространство YUV
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M07452 = function M07452(room)
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
			var cu = vertex.y;
			var cv = vertex.z;

			var color = new THREE.Color(
			  cy+0.000*cu+1.140*cv,
			  cy-0.394*cu-0.581*cv,
			  cy+2.028*cu+0.000*cv
			);
			face.vertexColors[i] = color;
		  }
		});		
	
	// цветови оси
	this.axisY = new MEIRO.Vector(new THREE.Vector3(1,0,0),1,'black');
	this.axisY.position.set(2,0,0);
	this.axisU = new MEIRO.Vector(new THREE.Vector3(0,1,0),1,new THREE.Color(0,0,1));
	this.axisU.position.set(-1.97,2,0);
	this.axisV = new MEIRO.Vector(new THREE.Vector3(0,0,1),1,new THREE.Color(0.57,0,0));
	this.axisV.position.set(-1.97,0,2);

	// надписи
	this.labelY = new MEIRO.Label('Y',0.4,-0.1,0.25,0);
	this.labelY.material = new THREE.MeshPhongMaterial({color:'black'});
	this.labelY.position.set(3,0,0);
	this.labelU = new MEIRO.Label('U',0.4,-0.08,0.1,0);
	this.labelU.material = new THREE.MeshPhongMaterial({color:new THREE.Color(0,0,1/2)});
	this.labelU.position.set(-2,3,0);
	this.labelV = new MEIRO.Label('V',0.4,-0.1,0.25,0);
	this.labelV.material = new THREE.MeshPhongMaterial({color:new THREE.Color(0.57/2,0/2,0/2)});
	this.labelV.position.set(-2,0,3);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ЦВЕТОВИ ОСИ', 'images/show.hide.png');
	this.toggle.hide();
	this.onToggle(this.toggle);
	
	// сглобяване на целия модел
	this.image.add(this.cube,this.axisV,this.axisU,this.axisY,this.labelV,this.labelU,this.labelY);
}

MEIRO.Models.M07452.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07452.DIST = {MIN:8, MAX:20, HEIGHT:0};
MEIRO.Models.M07452.POS = {DIST:13, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07452.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07452.prototype.onAnimate = function(time)
{
	this.labelV.rotateLabel();
	this.labelU.rotateLabel();
	this.labelY.rotateLabel();
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07452.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Цветово пространство YUV</h1>';

	s += '<p>Това цветово пространство се отчита специфичните особености на човешкото възприемане на цвят. Използва се за представяне на цвета, с възможност за компресиране на тези цветове, към които човек има по-слаб усет. Компонентите са яркост <em>Y</em>, а <em>U</em> и квадратура <em>V</em> са цветност</p>'; 
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07452.prototype.onToggle = function(element)
{
	var v = !this.axisV.visible;
	this.axisV.visible = v;
	this.axisU.visible = v;
	this.axisY.visible = v;
	this.labelV.visible = v;
	this.labelU.visible = v;
	this.labelY.visible = v;
	reanimate();
}