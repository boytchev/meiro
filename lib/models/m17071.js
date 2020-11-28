
//	Основи на Компютърната Графика
//	Модел 17071 - Вертикално изрязване с равнина
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17071 = function M17071(room)
{
	MEIRO.Model.apply(this, arguments);

	// сфери
	var p = new THREE.Vector3(0,0,0).multiplyScalar(this.image.scale.x).add(this.image.position);
	var v = new THREE.Vector3(1,0,0);
	this.clippingPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(v,p);
	
	this.n = 20;
	this.sphere = [];
	this.antiSphere = [];
	for (var i=0; i<this.n; i++)
	{
		var r = THREE.Math.randFloat(0.5,1);
		var color = MEIRO.RandomColor(); 
		var sphere = new MEIRO.Sphere(r);
		sphere.material = new THREE.MeshPhongMaterial({
			color: color,
			clippingPlanes: [this.clippingPlane],
			side: THREE.DoubleSide,
		});
		sphere.speed = new THREE.Vector3(THREE.Math.randFloat(3,6),THREE.Math.randFloat(3,6),THREE.Math.randFloat(3,6));
		sphere.offset = THREE.Math.randFloat(0,2*Math.PI);
		this.sphere.push( sphere );
	}
	
	// равнина
	this.plane = new MEIRO.Cube();
	this.plane.scale.set(0.03,7,10);
	this.plane.material = new THREE.MeshNormalMaterial({
					transparent:true,
					opacity:0.2,
					side: THREE.DoubleSide,
				});
	this.plane.renderOrder = 2;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СМЯНА', 'images/toggle.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.plane);
	for (var i=0; i<this.n; i++) this.image.add(this.sphere[i]);
}

MEIRO.Models.M17071.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17071.DIST = {MIN:5, MAX:30, HEIGHT:0};
MEIRO.Models.M17071.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M17071.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17071.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var ofs = this.sphere[i].offset;
		var speed = this.sphere[i].speed;
		this.sphere[i].position.x = 2*Math.sin(rpm(time+100*ofs,speed.x)+ofs+i);
		this.sphere[i].position.y = 2*Math.cos(rpm(time,speed.y)+ofs+i);
		this.sphere[i].position.z = 2*Math.sin(rpm(time,speed.z)-ofs+i);
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M17071.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Вертикално изрязване с равнина</h1>';

	s += '<p>Равнина се задава с равенство <em>ax+by+cz+d = 0</em>. За да се отдели едното полупространство, се работи с неравенството <em>ax+by+cz+d &gt; 0</em> &ndash; това е положителното полупространство. В този модел сфери се движат в пространството, но се рисува само тази част от тях, която е в положителното полупространство.</p>';

	s += '<p>За да се работи с другото полупространство се използва същата равнина. Разликата е в уравнението, което е <em>ax+by+cz+d &lt; 0</em>. За да стане положително, го преобразуваме на <em>-ax-by-cz-d &gt; 0</em>.</p>';
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M17071.prototype.onToggle = function(element)
{
	this.clippingPlane.normal.x = -this.clippingPlane.normal.x;
	this.clippingPlane.constant = -this.clippingPlane.constant;
	
	reanimate();
}


MEIRO.Models.M17071.prototype.onEnter = function()
{
	renderer.localClippingEnabled = true;
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M17071.prototype.onExit = function()
{
	renderer.localClippingEnabled = false;
	MEIRO.Model.prototype.onExit.call(this);
}
