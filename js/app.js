var Unit = {
	tpl : function(id){
		return document.getElementById(id).innerHTML;
	},
	ajax:function(url , fn){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if(xhr.status === 200 || xhr.status === 304){
					fn && fn(xhr.responseText)
				}
			}
		};
		xhr.open('GET' , url ,true);
		xhr.send();
	}
}

//处理价格的过滤器
Vue.filter('price',function(value){
	return value + '元';
})
//处理门市的过滤器
Vue.filter('orignPrice',function(value){
	return '门市价：'+value + '元';
})
Vue.filter('sales',function(value){
	return '已售' + value;
})
Vue.filter('loadMore',function(value){
	return '查看其他' + value + "团购"
})
/*首页的组件*/
var Home = Vue.extend({
	template:Unit.tpl('tpl_home'),
	data:function(){
		return {
			types: [
				{id: 1, title: '美食', url: '01.png'},
				{id: 2, title: '电影', url: '02.png'},
				{id: 3, title: '酒店', url: '03.png'},
				{id: 4, title: '休闲娱乐', url: '04.png'},
				{id: 5, title: '外卖', url: '05.png'},
				{id: 6, title: 'KTV', url: '06.png'},
				{id: 7, title: '周边游', url: '07.png'},
				{id: 8, title: '丽人', url: '08.png'},
				{id: 9, title: '小吃快餐', url: '09.png'},
				{id: 10, title: '火车票', url: '10.png'}
			],
			ad:[],
			list:[]

		}
	},
	created : function(){
		// console.log(this)
		//显示搜索框
		this.$parent.hideSearch = true;
		var that = this;
		Unit.ajax('data/home.json', function(res){
			//将返回的数据转化为json
			res = JSON.parse(res);
			if(res.errno === 0){
				//添加广告数据
				that.$set('ad',res.data.ad)
				//添加列表数据
				that.$set('list',res.data.list)
			}
		})
	}

})

// JS 函数动画需要通过 Vue.effect 方法来注册一个效果，包括一个进场函数和一个出场函数：

// Vue.effect('my-effect', {
//     enter: function (el, insert, timeout) {
//         // insert() 会将元素插入 DOM
//     },
//     leave: function (el, remove, timeout) {
//         // remove() 会将元素移除出 DOM
//     }
// })
//列表页组件
var List = Vue.extend({
	template:Unit.tpl('tpl_list'),
	data : function(){
		return {
			types :[
				{value: '价格排序', key: 'price'},
				{value: '销量排序', key: 'sales'},
				{value: '好评排序', key: 'evaluate'},
				{value: '优惠排序', key: 'discount'}

			],
			list:[],
			other:[]
		}
	},
	created:function(){
		this.$parent.hideSearch = true;
		var that = this;

		var query = that.$parent.query;
		// 拼凑query字符串
		var queryStr = '';
		if (query && query.length === 2) {
			queryStr = '?' + query[0] + '=' + query[1]
		}
		Unit.ajax('data/list.json?type=1',function(res){
			res = JSON.parse(res);
			if(res.errno === 0){
				that.$set('list',res.data.slice(0,3))
				that.$set('other',res.data.slice(3))
			}
		})
	},
	methods:{
		loadMore : function(){
			this.list = [].concat(this.list,this.other);

			this.other = [];
		},
		//排序，点击按钮 对list排序
		sortBy:function(key){
			this.list.sort(function(a,b){
				if(key === 'discount'){
					return (b.orignPrice - b.price) - (a.orignPrice - b.price)
				}else{
					//从大到小排序
					return b[key] - a[key]
				} 
			})
		}
	}
})
//商品组件
var Product = Vue.extend({
	template:Unit.tpl('tpl_product'),
	data:function(){
		return {
			product:{
				src : '01.jpg'
			}
		}
	},
	created:function(){
		var that = this;
		this.$parent.hideSearch = false;
		Unit.ajax('data/product.json' , function(res){
			res = JSON.parse(res);

			if(res.errno === 0 ){
				that.$set('product',res.data)
			}
		})
	}

})

Vue.component('home',Home);

Vue.component('list',List);

Vue.component('product',Product);
var app = new Vue({
	el:'.app',
	data:{
		view:'list',
		//储存hash的信息
		query:[],
		hideSearch:true
	}

})
//路由
var route = function(){

	var hash = location.hash;
	hash = hash.slice(1).replace(/^\//,'');
	hash = hash.split('/')

	app.view = hash[0] || 'home';
	app.query = hash.slice(1)

}
window.addEventListener('hashchange',route)
window.addEventListener('load',route)