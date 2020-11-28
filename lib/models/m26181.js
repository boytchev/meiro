
//	Основи на Компютърната Графика
//	Модел 26181 - Анимация на слоеве чрез транслация
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26181 = function M26181(room)
{
	MEIRO.Model.apply(this, arguments);

	var map = new THREE.TextureLoader().load('data:image/jpeg;base64,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');
	map.anisotropy = 16;
	map.repeat.set(4,1);
	map.wrapS = THREE.RepeatWrapping;
	map.wrapT = THREE.RepeatWrapping;
	
	function Floor()
	{
		var room = new THREE.Mesh(
			new THREE.CylinderBufferGeometry(2*Math.SQRT2,2*Math.SQRT2,4,4,1,true),
			new THREE.MeshBasicMaterial({map:map})
		);
		room.position.y = 1;
		
		var roof = new THREE.Mesh(
			new THREE.CylinderBufferGeometry(4*Math.SQRT2,2*Math.SQRT2,2,4,1),
			new THREE.MeshBasicMaterial({map:map,color:'orange'})
		);
		roof.position.y = 4;
		
		var pagoda = new THREE.Object3D();
		pagoda.add(room,roof);
		return pagoda;
	}

	function Pagoda(n)
	{
		var pagoda = Floor();
		pagoda.rotation.y = 2*Math.PI*Math.random();
		pagoda.scale.set(0.2,0.2,0.2);
		for (var p=pagoda; n>1; n--)
		{
			var newP = Floor();
			newP.position.y = 5;
			newP.scale.set(0.85,0.85,0.85);
			p.add( newP );
			p.subpagoda = newP;
			p = newP;
		}
		
		return pagoda;
	}
	
	this.pagoda = [];
	for (var i=0; i<15; i++)
	{
		var p = Pagoda(2+25*Math.random());
		p.position.set(20*Math.random()-10,Math.random()/10-4,20*Math.random()-10);
		this.pagoda.push( p );
	}
	
	// сглобяване на целия модел
	for (var i=0; i<15; i++)
		this.image.add(this.pagoda[i]);
}

MEIRO.Models.M26181.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26181.DIST = {MIN:10, MAX:30, HEIGHT:0};
MEIRO.Models.M26181.POS = {DIST:15, ROT_X:0, ROT_Y:0};
MEIRO.Models.M26181.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26181.prototype.onAnimate = function(time)
{
	for (var i=0; i<15; i++)
	{
		var offset = Math.sin(i);
		for (var p=this.pagoda[i].subpagoda; p; p=p.subpagoda)
			p.position.y = 5.5+3*Math.sin(rpm(time,30)+offset);
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M26181.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Анимация на слоеве чрез транслация</h1>';

	s += '<p>Анимацията в този модел е постигната чрез транслация между всеки два слоя. Това, което се променя, е положението на локалната координатна система на един слой, спрямо локалната координатна система на предходния слой.</p>';
	element.innerHTML = s;
}
