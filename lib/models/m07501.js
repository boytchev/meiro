
//	Основи на Компютърната Графика
//	Модел 07501 - Преобразуване от RGB към черно-бяло
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M07501 = function M07501(room)
{
	MEIRO.Model.apply(this, arguments);

	// куб
	this.cube = 0;
	this.cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1,32,32,32));
	this.cube.scale.set(4,4,4);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n123.png');
	this.toggle.state = 0;
	this.toggle.stateTexts = ['(R+G+B)/3','0.3R+0.6G+0.1B','(Min+Max)/2'];
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();

	this.colorizeGrayscale(this.cube);
	
	// сглобяване на целия модел
	this.image.add(this.cube);
}

MEIRO.Models.M07501.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07501.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M07501.POS = {DIST:15, ROT_X:0.5, ROT_Y:0.5};
MEIRO.Models.M07501.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M07501.prototype.onAnimate = function(time)
{
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07501.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Преобразуване от RGB към черно-бяло</h1>';

	s += '<p>Съществуват много начини за преобразуване от RGB към черно-бяло. Някои са по-бързи, други са по-точни; някои са удобни за рисунки, други &ndash - за фотографии. Общото между тях е, че запазват неутралните цветове.</p>'; 
	s += '<p>В този модел се демонстрират три от тези начина:';
	s += '<ul><li>С най-плавни цветове</li><li>С най-точни представяне</li><li>С най-бързо изчисление</li></ul></p>';
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07501.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.colorizeGrayscale(this.cube);

	reanimate();
}



MEIRO.Models.M07501.prototype.colorizeGrayscale = function (object)
{
	object.material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});

	var faceIndices = ['a','b','c'];
	var geometry = object.geometry;
	
	var that = this;
	
	geometry.faces.forEach(
		function(face)
		{
			for (var i = 0; i < 3; i++)
			{
				var vertexIndex = face[faceIndices[i]];
				var vertex = geometry.vertices[vertexIndex];
				
				var r = vertex.x+0.5;
				var g = vertex.y+0.5;
				var b = vertex.z+0.5;
				var c;
				
				switch (that.toggle.state)
				{
					case 0: c = (r+g+b)/3; break;
					case 1: c = 0.299*r+0.587*g+0.114*b; break;
					case 2: c = (Math.min(r,g,b)+Math.max(r,g,b))/2; break;
				}
				face.vertexColors[i] = new THREE.Color(c,c,c);
			}
		}
	);		
	
	geometry.elementsNeedUpdate = true;
}