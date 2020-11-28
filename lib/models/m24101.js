
//	Основи на Компютърната Графика
//	Модел 24101 - Фамилии прави по NURBS повърхност
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M24101 = function M24101(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 6;
	
	var map = new THREE.TextureLoader().load('data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAIAAgAwERAAIRAQMRAf/EAHIAAQEBAQAAAAAAAAAAAAAAAAYABQgBAQEBAQAAAAAAAAAAAAAAAAAFAwIQAAADAw0BAAAAAAAAAAAAAAACAwETBhExQRLSg6OzBFQFFgc2EQABAgUDBQAAAAAAAAAAAAABAAJRoQMEBTGB0VKyFDQV/9oADAMBAAIRAxEAPwDqkERr0n4vkbnPTFLEey3ftK4qaK82+L46+z1Ay/su27QlPRJRNXawe8wtvcJawMfIZFUvkXPTNvKO+hxnDS0H8gmnrKxzOZGO1WTLkbSQUcVdUxcNJMYwKyrYq4a0ktmOVeeRnDSMH8emprKpyvpWO1WzrnbQQMrdUzcOIMIwCUcVcOaCGzHKRd5hbe4S1gTvIZFa/IuembeVdGhbZYq1sPHZBPr3PVJvCO+hwZDSMH8gono6pyuZGvFWzrkZScUcVa0zcNBEYwKyrZW4c0gukOFeeQZDS0H8eopo6xzPpWvFWTLnZQcMra0xcOAEIwCUcrcNaAHSHCRdGhbZYq1sTvHZBa/XueqTeFvDZTUa9J+L5G5z0xSxHst37SuKmivNvi+Ovs9QMv7Ltu0JT0SUTV2v/9k=' );
	map.anisotropy = 16;
	map.repeat.set(20,20);
	map.offset.set(0.5,0.5);
	map.wrapS = THREE.RepeatWrapping;
	map.wrapT = THREE.RepeatWrapping;
	
	// плочка
	this.speed = [];
	this.offset = [];
	this.amplitude = [];
	for (var i=0; i<this.n; i++)
	{
		this.speed.push( [] );
		this.offset.push( [] );
		this.amplitude.push( [] );
		for (var j=0; j<this.n; j++)
		{
			this.speed[i].push( 0.001*(Math.random()+1) );
			this.offset[i].push( Math.random()*Math.PI*2 );
			this.amplitude[i].push( ((i==0 && j==0) || (i==this.n-1 && j==0) || (i==0 && j==this.n-1) || (i==this.n-1 && j==this.n-1) )?1:2 );
		}
	}

	this.object = new MEIRO.Bezier3D(this.n);
	this.object.material = new THREE.MeshLambertMaterial({map:map,side:THREE.DoubleSide});
	
	this.light = new THREE.AmbientLight('white',0.3);
	
	// сглобяване на целия модел
	this.image.add(this.object,this.light);
}

MEIRO.Models.M24101.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24101.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M24101.POS = {DIST:10, ROT_X:0.5, ROT_Y:0.2};
MEIRO.Models.M24101.ROT_Y = {MIN:-0.1, MAX:0.7};

// аниматор на модела
MEIRO.Models.M24101.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
		for (var j=0; j<this.n; j++)
			this.object.setControlPoint(i,j,
				i-(this.n-1)/2,
				this.amplitude[i][j]*Math.sin(this.offset[i][j]+this.speed[i][j]*time),
				j-(this.n-1)/2
			);
		
	this.object.recalculate();
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M24101.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Фамилии прави по NURBS повърхност</h1>';

	s += '<p>NURBS повърхността може да се разглежда като две взаимно перпендикулярни фамилии успоредни криви. На показаният модел кривите от едната фамилия са червени, а от другата са сини.';
	s += '<p>Кривите от една и съща фамилия не се пресичат и ако повърхността се изправи до равнинен квадрат, те ще са успоредни прави. Аналогично, коя да е крива от едната фамилия е перпендикулярна на коя да е крива от другата фамилия.';
	
	element.innerHTML = s;
}