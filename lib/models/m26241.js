
//	Основи на Компютърната Графика
//	Модел 26241 - Модел на палма
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26241 = function M26241(room)
{
	MEIRO.Model.apply(this, arguments);

	var ratio = 0.9;
	var trunkGeometry = new THREE.CylinderGeometry(0.2*ratio,0.2,1,8,1,!true);
	var trunkMaterial = new THREE.MeshPhongMaterial({color:'chocolate'});
	trunkGeometry.translate(0,0.5,0);

	var leavesGeometry = new THREE.Geometry();
	var leafGeometry = new THREE.SphereGeometry(1,2,16,-0.3,0.6);
	leafGeometry.translate(-0.5,1.05,0);
	leafGeometry.rotateZ(-Math.PI/2);
	var leaf = new THREE.Mesh(leafGeometry);
	for (var i=0; i<5; i++)
	{
		leaf.rotation.y = 2*Math.PI * i/5;
		leavesGeometry.mergeMesh(leaf);
	}
	var leafMaterial = new THREE.MeshPhongMaterial({color:'forestgreen',side:THREE.DoubleSide});
	
	function Tree()
	{
		var t;
		var tree = new THREE.Mesh(trunkGeometry,trunkMaterial);
		for (t=tree, n=0; n<10; n++)
		{
			var newTree = new THREE.Mesh(trunkGeometry,trunkMaterial);
			newTree.position.y = 0.9;
			newTree.scale.set(ratio,1,ratio);
			t.add( newTree );
			t.subtree = newTree;
			t = newTree;
		}
		
		for (var i=0; i<2; i++)
		{
			var pow = Math.pow(0.8,i);
			var powXZ = Math.pow(1/ratio,10);
			var newLeaf = new THREE.Mesh(leavesGeometry,leafMaterial);
			newLeaf.scale.set(pow*powXZ,pow,pow*powXZ);
			newLeaf.position.y = 0.6*i;
			newLeaf.rotation.y = 2*Math.PI/10*i;
			t.add( newLeaf );
		}
		
		return tree;
	}
	
	this.tree = [];
	for (var i=0; i<10; i++)
	{
		var t = Tree();
		t.position.set(16*Math.random()-8,Math.random()/10-3,16*Math.random()-8);
		this.tree.push( t );
	}
	
	// сглобяване на целия модел
	for (var i=0; i<10; i++)
		this.image.add(this.tree[i]);
}

MEIRO.Models.M26241.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26241.DIST = {MIN:10, MAX:40, HEIGHT:-3};
MEIRO.Models.M26241.POS = {DIST:20, ROT_X:0, ROT_Y:0};
MEIRO.Models.M26241.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26241.prototype.onAnimate = function(time)
{
	for (var i=0; i<10; i++)
	{
		var offset = Math.sin(i);
		for (var t=this.tree[i].subtree,n=0; t; t=t.subtree,n++)
		{
			var s = 0.03+0.03*Math.cos( (n-5.5)/5.5 * Math.PI/2 );
			t.rotation.x = s*Math.sin(0.0013*time+n/4+offset);
			t.rotation.y = s*Math.cos(0.0011*time+n/6-offset);
		}
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26241.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Модел на палма</h1>';

	s += '<p>Стъблото на палмата е създадено като много слоеве от пресечени конуси. размерите им се намаляват по такъв начин, че горният край на всеки конус съвпада по размер с долния край на конуса над него. Извиването на стъблото е чрез слаба ротация на слоевете най-вече в централната зона на стъблото.</p>';
	
	element.innerHTML = s;
}
