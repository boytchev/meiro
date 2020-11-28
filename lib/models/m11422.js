
//	Основи на Компютърната Графика
//	Модел 11422 - Движение по пръстен от отсечки
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M11422 = function M11422(room)
{
	MEIRO.Model.apply(this, arguments);

	// възли
	this.n = 10;
	this.node = [];
	this.line = [];
	var material = new THREE.MeshLambertMaterial({color:'lightgray'});
	for (var i=0; i<this.n; i++)
	{
		var a = i/this.n*2*Math.PI;
		
		var node = new MEIRO.Cube(0.8);
		node.material = material;
		node.offset = Math.random()*2*Math.PI;
		node.position.set(5*Math.cos(a),3*Math.sin(i*i+node.offset),5*Math.sin(a));
		node.rotation.y = -a;
		this.node.push(node);
	}	

	var material = new THREE.LineBasicMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		line = new MEIRO.Line(this.node[i].position,this.node[(i+1)%this.n].position);
		line.material = material;
		this.line.push(line);
	}
	
	// топка
	this.ball = new MEIRO.Sphere(0.5);
	this.ball.material = new THREE.MeshPhongMaterial({color:'red'});
	this.ball.position.copy(this.node[0].position);
	
	// движение
	this.t = 0;
	this.v = new THREE.Vector3();
	this.i = -1;
	
	// сглобяване на целия модел
	for (var i=0; i<this.n; i++)
		this.image.add(this.node[i],this.line[i]);
	this.image.add(this.ball);
}

MEIRO.Models.M11422.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11422.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M11422.POS = {DIST:15, ROT_X:1.2, ROT_Y:0.1};
MEIRO.Models.M11422.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11422.prototype.onAnimate = function(time)
{
	if (this.t)
	{
		this.ball.position.add(this.v);
		this.t--;

		var i = Math.round(this.i+this.n/2)%this.n;
		var j = (i+1)%this.n;
		var k = (i+2)%this.n;
		this.node[j].position.y = THREE.Math.lerp(this.node[j].position.y,5*Math.sin(time/600),0.01);
		this.line[i].setTo(this.node[j].position);
		this.line[j].setFromTo(this.node[j].position,this.node[k].position);
	}
		else
	{
		this.i = (this.i+1)%this.n;
		var j = (this.i+1)%this.n;
		this.ball.position.copy(this.node[this.i].position);
		this.v.subVectors(this.node[j].position,this.node[this.i].position);
		this.v.multiplyScalar(1/50);
		this.t = 50;
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M11422.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Движение по пръстен от отсечки</h1>';

	s += '<p>Този модел показва непрекъснато движение по пръстен от отсечки. При достигане на възел се пресмята новия вектор на движение, който се ползва до достигане на следващия възел.</p>';
	
	element.innerHTML = s;
}
