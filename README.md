# generator-vtester 

vtester是基于yeoman的generator，用于生成自动化测试项目结构和翻译uc文件成macaca执行文件

## 安装

```bash
npm install -g yo
npm install -g generator-vtester
```

然后生成项目:

```bash
yo vtester
```

## 名词说明

### uc
表示测试用例，如果出现在文件夹名称中，那说明该文件夹下面都是测试用例文件，如果出现在文件名，那该文件名是测试用例文件

### handler
表示处理者，测试用例中个别测试过程会比较复杂，比如判断ajax返回的数据是否是预期的数据等等，都有处理者来处理。如果出现在文件夹名称中，那说明该文件夹下面都是handler文件，如果出现在文件名，那该文件是测试用例handler

### filter
表示过滤器，当前用于过滤android的ListView，获取想要的元素，需要Description配合

## 目录说明

```bash
projectName
|-src
	|-dist
	|-handler
	|-filter
	|-uc
|-test
```

###src
src里面包含项目使用的所有文件

####dist
在项目根目录，执行vtester:build子命令，会把uc文件夹下的文件转换成macaca执行文件到这里

####handler,filter,uc
这里分别存放handler,uc和filter文件，大量的测试代码都在这两个文件夹下面

##uc文件说明
uc文件是一个标准node模块文件

uc可以嵌套uc，下层uc是上层uc的子uc，叶子uc(没有子uc)可以包含paths，paths就是用例的执行路径，比如点击按钮-》输入标题-》点击提交等等一系列操作，每个path都可以包含一个checker，checker用于检查当前的path是否符合预期，比如点击提交按钮以后，可以检查一下是否有验证出现，简单结构如下：

```javascript
uc:{
	子uc:{
		paths:{
			checker:{
				checkOp:{}
			}
		}
	}
}
```
完整的结构如下

**前面*表示必填，不是属性名的一部分**

```javascript
module.exports = {
	ucKey:'uc唯一表示',
	*title:'标题',
	build:true(缺省)|false,
	handler:true|false(缺省),
	sleep:'停留时间',
	only:true|false(缺省),
	children:[
		{
			ucKey:'uc唯一表示',
			*title:'标题',
			preUc:'前置用例',
			sleep:'停留时间',
			paths:[
				{
					*type:'url|click|input|keys',
					url:'当type=url时必填',
					selector:'xpath|name|className|id',
					element:'selector值',
					value:'type=input的值'
					filter:{property:'属性',op:'==|>',value:"直接值|${表达式}"},
					cacheElement:true|false(缺省),
					cacheDesc:true|false(缺省),
					canNull:true|false(缺省),
                 context:"webview|navive android专用",
					error:'错误信息',
					sleep:'停留时间',
					"checker":{
						"stop|eq|eqs|ajax|length":{
							title:'标题',
							selector:'xpath|name|className',
							element:'selector值',
							value:'check的值',
							url:'ajax专用',
							doer:'ajax专用',
							sleep:'停留时间'
						}
					}
				}
			]
		}
	]
}
```

###通用属性说明

####ucKey
每个uc都可以用这个属性唯一标示
> 建议：android用Activity或fragment类名表示

####title

uc标题/子uc标题/path标题/checker标题

####build
用于控制uc文件是否生成macaca执行文件到dist目录，true生成，false不生成，缺省true

####handler
用于控制是否对该uc文件生成handler文件，true生成，false不生成，缺省true

####sleep
停留时间，uc，path和checker都可以设置

####preUc
前置uc，配置了以后，会先执行该uc，再执行当前uc

####selector
页面元素筛选器类型，组件默认支持xpath,name,className

####element
筛选器的具体值

####filter
用于过滤获取到的elements列表，过滤出需要的

####cacheElement
如果path中cacheElement为true，则会把获取到的element缓存到driver. cacheElements中

####cacheDesc
如果path中cacheDesc为true，则会把获取到的element的description缓存到driver.cacheDescs中

###path说明

> path指一系列的线性操作路径，比如**输入XXX->点击按钮A->点击按钮B->输入YYY**，下面详细介绍当前支持的操作类型

####click

>支持:Web Android
>
>说明:selector和element为空则直接调用click方法。canNull为true则允许获取的元素为空

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'click',
	selector:'xpath|name|className|id',
	element:'selector值',
	canNull:true|false(缺省),
	inThen:'true|false(缺省)，是否包含在then里面'
}
```

####tap

>支持:Web Android
>
>说明:selector和element为空则直接调用drag.tap方法。canNull为true则允许获取的元素为空

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'tap',
	selector:'xpath|name|className|id',
	element:'selector值',
	canNull:true|false(缺省)
}
```

####clicks

>支持:Web Android
>
>说明:点击全面获取的多个元素

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'clicks'
}
```

####get

>支持:Android
>
>说明:通过过滤器从列表中获取需要的element

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'get',
	*selector:'id',
	*element:'selector值',
	index:'需要获取元素的下标',
	mode:'first|last',
	filter:{target:'description(android缺省)|text|value(ios缺省)',property:'属性',op:'==|>|in',value:"直接值|${表达式}"},
	cacheElement:true|false(缺省),
	cacheDesc:true|false(缺省)
}
```


####gets

>支持:Android
>
>说明:获取多一个元素

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'gets',
	*selector:'id',
	*element:'selector值',
	limit:'获取的数量'
}
```

####input

>支持:Web Android
>
>说明:向输入框输入值

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'input',
	*selector:'id',
	*element:'selector值',
	value:'输入值'
}
```

####keys

>支持:Android
>
>说明:输入控制键

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'keys',
	value:'输入值'
}
```

####press

>支持:Android
>
>说明:长按,对上一个取到的元素长按

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'press',
	selector:'xpath|name|className|id',
	element:'selector值',
	*value:'输入值'
}
```

####cmd

>支持:Android
>
>说明:操作命令，subType=cache,说明缓存最后一个cmdCode的值，为了后面判断

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'cmd',
	*cmdCode:'命令名称',
	*subType:'子类型cache'
}
```

####context

>支持:Android
>
>说明:切换上下文

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'context',
	*target:'native|webview'
}
```

####edrag
>支持:ios
>
>说明:拖动元素

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'edrag',
	*fromXOffset:'起点x先对元素偏移量',
   *fromYOffset:'起点y先对元素偏移量',
   *toXOffset:'终点x先对元素偏移量',
   *toYOffset:'终点y先对元素偏移量'
}
```

####drag
>支持:ios android web
>
>说明:拖动元素

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'drag',
	*fromX:'起点x',
   *fromY:'起点y',
   *toX:'终点x',
   *toY:'终点y'
}
```


####alert
>支持:ios android
>
>说明:处理alert

完整的配置

```javascript
{
	*title:'标题说明',
	*type:'alert',
	*target:'dismiss|accept'
}
```

###checker
> checker指对一个path的验证，是否符合预期，比如不输入用户名直接点击保存，则**点击保存**可以放一个checker，用于验证是否有提示

####eq
>支持:Web Android
>
>说明:用于检查元素的值, selector如果没有设置, 则基于上一个元素, Android需要Description配合

完整的配置

```javascript
'eq':{
	selector:'xpath|name|className|id',
	element:'selector值',
	*value:'检测值'
}
```

####eqs
>支持:Web
>
>说明:用于检查多个元素的值

完整的配置

```javascript
'eqs':{
	*selector:'xpath|name|className|id',
	*element:'selector值',
	*value:'检测值,多个值逗号隔开，如:aaa,bbb,ccc'
}
```

####length
>支持:Android
>
>说明:用于检查元素的数量

完整的配置

```javascript
'length':{
	*selector:'xpath|name|className|id',
	*element:'selector值',
	*value:'检测值,多个值逗号隔开，如:aaa,bbb,ccc'
}
```

####prop
>支持:Android
>
>说明:用于检查元素的属性值，需要Description配合

完整的配置

```javascript
'prop':{
	target:'description(android缺省)|value(ios缺省)'
	*key:'属性名称',
	*op:'操作符',
	*value:'直接值|${表达式}',
	canNull:'比较的元素可以为空，true|false(缺省)',
	returnE:'是否返回原生，true(缺省)|false'
}
```

####eexist
>支持:Android
>
>说明:用于检查元素是否存在

完整的配置

```javascript
'eexist':{
	*selector:'xpath',
	*element:'selector值'
}
```



####stop
>支持:Web
>
>说明:一旦元素的值匹配，停止执行下面的path

完整的配置

```javascript
'stop':{
	*selector:'xpath',
	*element:'selector值',
	*value:'检测值'
}
```