
//	Основи на Компютърната Графика
//	Модел 27321 - Трансформации на текстурни координати
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M27321 = function M27321(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var map = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAFVBMVEX///8AAAD7+/vLy8vHx8f39/efn59/UC4LAAAALklEQVQoz2MQRAMMYs7GSMAkkUEkSAkJqDoyCCswIAEmw1GBoSKAHpUYkY2RHABjDxfpOpjxcQAAAABJRU5ErkJggg==');
	map.anisotropy = 16;
	map.wrapT = THREE.RepeatWrapping;
	map.wrapS = THREE.RepeatWrapping;

	this.material = new THREE.MeshPhongMaterial({map:map, color:'cornflowerblue',shininess:50});
	
	// кубове
	this.cube = [];
	for (var x=-1; x<2; x++)
	for (var y=-1; y<2; y++)
	for (var z=-1; z<2; z++)
		if (Math.abs(x)+Math.abs(y)+Math.abs(z)>1)
		{
			var cube = new MEIRO.Cube(1);
			cube.position.set(x,y,z);
			cube.material = this.material;
			this.cube.push(cube);
		}
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Кубчета', 'images/multiply.png');
	this.toggle.state = 0;
	this.toggle.hide();
	
	var light = new THREE.PointLight('white',1.5);
	light.position.set(0,1.5,0);
	
	// сглобяване на целия модел
	this.image.add(light);
	for (var i=0; i<this.cube.length; i++)
		this.image.add(this.cube[i]);
}

MEIRO.Models.M27321.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27321.DIST = {MIN:5, MAX:15, HEIGHT:0};
MEIRO.Models.M27321.POS = {DIST:10, ROT_X:0.3, ROT_Y:0.3};
MEIRO.Models.M27321.ROT_Y = {MIN:-0.3, MAX:0.7};



// аниматор на модела
MEIRO.Models.M27321.prototype.onAnimate = function(time)
{
}



// информатор на модела
MEIRO.Models.M27321.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Мащабиране на текстура</h1>';

	var n = this.material.map.repeat.x;
	
	s += '<p>С текстура може да се създаде илюзия за много обекти, докато в реалност те са много по-малко. Този модел съдържа '+this.cube.length+' куба, но благодарение на текстурата всеки от тях изглежда като съставен от '+(n*n*n)+' кубче'+(n>1?'та':'')+' ('+n+'x'+n+'x'+n+').</p>';

	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M27321.prototype.onToggle = function(element)
{
	var count = [1,2,3,5,10,20];
	
	this.toggle.state = (this.toggle.state+1)%(count.length);
	
	var n = count[this.toggle.state];
	
	this.material.map.repeat.set(n,n);
	reanimate();
}
