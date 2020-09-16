# 游戏规则
一个随机的Tetromino序列（每个是由四个块组成的形状），从游戏场地（一个矩形的竖直桶，well井，matrix矩阵）顶端降落。
游戏的目的是操纵这些Tetromino，把每一个平行移动和以90度为单位旋转，来创造了10块无间隙的水平行。
当一行被填满，它就会消失，在这被删除的行上面的块都将下降。
当清除一定数量的行（或其它目标）达到后，游戏将进入一个新的等级。
随着游戏进行，每增加一个等级就会导致Tetromino下降更快。
当Tetromino堆到场地顶部，新的Tetromino无法进入场地时，游戏就结束了。

术语 | 别名 | 描述
---  | --- | ---
方块 | tetromino,pieces,tetrads,minoes | 俄罗斯方块的简称
已填充的方块:|blocks|
方块的填充|filled|
方块的空缺|vacate|
方格|cell|组成矩阵的小格子
矩阵|matrix|由行（rows）和列（columns）组成的2维界面

形状|shape|4个方块的基本排列方式
方向|direction,direct|方块的朝向，也是相对基本排列旋转90°的次数
定位点|point,location,origin,position|通过x轴和y轴来确定矩阵上移动的点

游戏场地|Playfield|游戏内容的主要展示界面
摇杆|joystick|控制方块的按钮
计分板|scoreboard|展示方块得分

文件夹
动作跟着状态走，共享状态就抽出来做更高一层

TODO: 核心功能
* 得分榜

TODO:非核心功能
* 音乐
* 填充动画、消除动画
* 数据缓存
* 是否聚焦

TODO: 方块与点合并，合并时去计算方块的相对位置

先shape和direction组成currenShape，再根据axis决定下落locate在哪个位置
shape是2维数组，因为形状是有限的，所以可以通过rotate函数计算出来shape旋转后的所有数据
并存储在一个数据中，通过direction来直接读取旋转后的数据，且在到达最大值后重新计数
rotate函数翻转1维下标和2维值
locate函数将最终获得的shape数据结合坐标axis，计算出哪行哪几个落下方块
所以locate函数计算出来的数据结构是以行为key，方块所在列为value的对象，且方块用数组来存储

* 一开始认为都使用key2value的结构来描写数据，实际使用过程中发现，几个基本形状大多都是2行，且二维数组的数据形态能很直观的看出数据和形状的对应关系。所以应该是在合适的时候使用合适的数据结构，最终在matrix操作的方块，因为数组下标会不断变化，此时仍用二维数组明显不合适，改成对象方式存储是个不错的办法。
* 本来认为是方块本身具有移动功能，但是随着事件函数的编写，发现方块其实就是一组数据，本身可以不具备除表示方块颜色以外的任何功能。方块位置形态的变化，交给函数处理，对应修改数据就能实现
* 目前经历3个阶段，一是基本数据结构的使用 二是核心功能函数的编写 三是用户交互部分的加入

最先考虑的是用什么样的数据来表示这个游戏最核心的两个部分：矩阵和方块。
直接想到的就是2维数组。但是方块本身是移动的，意味着表示方块的几个值的下标需要一直变化。
而且我希望表示矩阵的20*10的数据是属于静态内容的，它是不变的，是通过另一组数或者一个函数来改变其表示颜色的数值，以此修改最终展示的内容。
简单来说，底板是不变的，变化的是其上代表颜色的数值。通过这种数值的变动，实现方块移动、降落等动态的变化。

确定了核心数据的结构后，开始考虑最基本的上下左右操作如何实现。我以为方向操作都是属于方块本身的方法，它可以接到外界传来的动作，依此来改变数据，那么就需要分为3个小部分：
1. 表示方块形状的数据 
2. 旋转后的形状的数据
3. 方块位于matrix哪个位置
旋转之后还是方块，因此基本数据为两组：形状和位置。编写好对应的函数，就可以将方块的任意形状在matrix任何位置上展示出来了，这就意味着基本操作的实现。
但是在实现的时候，惊奇的发现，这游戏的功能不是这么理解的。方块就是方块，位置是属于matrix的！其实完全可以看作是matrix上降落了一个单位，这一个单位可以在matrix四处移动，除了往上升。同时出现4个相连的单位组成一个形状，成为tetromino(俄罗斯方块)，如果按上键，就会旋转这个方块。
重新理解后，就拆成了两部分，一是方块的初始值和旋转后的值 二是假设matrix上有个可移动单位，并用坐标轴来表示这个单位的位置。将这两个部分合并，就意味着基本操作的实现。

实现了核心数据和基本操作，就考虑如何加入用户交互了。也就是将上下左右四个按钮结合前面实现基本操作的函数。这时候，我认为的难点在于得兼容手机端和电脑端，得同时有鼠标、键盘、屏幕触碰三种交互方式。当我尝试去加入这三种方式的时候，突然间又发现了！
特么方块就只是一组数据，一组表示颜色的数据，它本身是啥也没有的！旋转，旋转是属于按钮的！
最终，方块只是一2维数组，当按下旋转按钮时，有个旋转函数接收当前表示方块的数据，修改这个数据并返回给matrix表示其旋转后的样式。

我本以为按钮只是发起一个动作，它不需要执行任何函数。当方块接收到这个动作后，方块内会根据这个动作在页面上做对应展示。而且，这和当下鼓吹的函数式编程思想不也很像么？不使用命令去操作方块，而是告诉方块要做什么。上下左右4个按钮，只是发起一个move动作，方块是这个动作的最终接收者，根据move上附加值不一样，方块会自动改变其展示。可惜的是，确定核心数据的时候，方块就不会是一个组件，只会一组表示颜色的数据了，而一组数据不该背负太多的方法。但是这样做，按钮就会和matrix强依赖了。
如果继续按函数式思考下去，那么承担这一切的就是matrix，matrix得有好些组数据及其方法。动态的方块，静态的填充。matrix会变得无比庞大，
再怎么函数式，你要实现的功能不会少，只是聚合代码的方向会不一样。
（我不是搞科研的，我也不会纠结于函数式究竟是怎么定义的，我更关注的是实现时思考的方向。如果觉得这不是函数式，我可以把名字改为数函式，对我来说，只是一组思路的代称而已。其它名称同理。）

总结一下这个思考过程，曾以为方块是一个对象，这个对象接收形状、位置、操作三个参数，通过这几个参数的变化来实现方块的动画和交互。后来一步步发现，方块只有形状。位置是属于matrix的，操作是属于按钮的。

注意事项：
## 边界值问题
在matrix中移动时，需要定位点+方块的长宽，才能避免超出边界
方块在旋转时，也会超出边界
因为设置了定位点，左边可以设定最小值0，但是右边会受方块长度影响，所以越界问题只会出现在右边
虽然可以通过计算最大可移动范围来限制定位点移动,但是这样旋转就会受影响，所以最好再增加一个方法来修改定位点。通过限制移动和修改x值似火已经解决了该问题。

但事实上，方块的移动和旋转还受已填充方块的影响
判断下一行是否有方块解决了方块填充问题，还需要判断当前行是否有方块

## 模块划分
计分板上有‘下个方块’，这里才是方块的初始位置。且其中大部分静态渲染功能和playing field相同，
所以完全可以抽出来其公共部分。

## 中心点
目前方块都是以定位点为中心计算旋转结果
但功能更完善的方案是，加入中心点，通过中心点来计算，目的是拆分定位与旋转的耦合关系
并且各个形状旋转方式是具有差异的，定位点不能同时实现两个功能
同时受影响的还有出发点、左右边界、踢墙
这样开发难度大了很多，而优化效果不够明显，延后排期

## 移动范围
两种方式来判断方块是否可移动：
1. 判断方块与矩阵间是否有交点，每次移动前，计算这次移动后是否阻塞，结果不阻塞才能移动
   1. 优点：通过遍历方块来计算结果，而不是矩阵
   2. 一个函数可以解决问题
2. 先计算出一个可移动范围，直接限制方块的移动
   1. 计算当x不变时，y的取值范围，以及当y不变时，x的取值范围
   2. 优点：有了取值范围，可以先移动，后计算
   3. 缺点：无论是x还是y移动，都需要重新计算另一个的取值访问
   
   

## 摇杆交互
方块有个自动降落功能，用setInterval实现
且可以通过设置变量 flag=!flag来切换暂停和开始两个状态
但是降落停止了，还是可以通过其它按钮操作
这样就得将其它按钮都附加一个flag=true来保证，一操作就会自动降落
暂停时，应该弹出来个界面，点击界面游戏开始。

## 延迟触发
方块降落有一个速度，判断方块填充有一个缓冲时间。
方块填充完后才重置定位点，这里会有一个时间间隔导致降落越界
这里想到两种解决方法：
1. 通过共享状态，当填充时，暂停方块降落
2. 方块自动降落加个判断，能降落才降落

## 游戏状态
通常来说，会设置状态扭转来改变当前游戏的状态，即开始-暂停-结束-重置
但其实可以把暂停状态抽离出来，作为动作的发起，以控制游戏的进行
也就是开始-结束-重置都会派发暂停动作，而这3个状态则由当前组件的数据来判断
对应数据 添加-清空-溢出 这3种情况，触发这3种情况时，设置对应的标志位来渲染组件

虽然代码上差不多，但是思想上从状态扭转变成了对数据的处理

>> This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## 游戏开始
// 方块一开始，只进入一行。所以要设置行的初始值，让其出现负数
// 判断行数是否为负数，不让其加入渲染
// 虽然当前方块也可以通过计算得出，不需要额外的声明
// 但是操作的数据多是当前方块，通过计算得出会有一定的代码难度

## 判断方块不能继续下落
1. 下方有方块，判断方式,方块的每一行和下一行比较，比较数组中是否有相同的数据，如果有，就将方块记录到落下
2. 如果到达最后一行，直接就记录
3. 如果下落的行为第一行，且下落位置已有方块，则游戏结束

// 判断方块左右移动的边界值，左右边界值为matrix.x的大小

// 硬降，判断所在列有方块的最小行，加入到该行

// 判断方块是否触发消除，比较列数组的个数是否等于列边界最大值

// TODO：加分和调整游戏难度

// 自动下落descend，下落的过程descent，操作落下dorp
// 方块的名字是tetrominos，操作的方块简称为pieces
// 已放置placed，落在land on

// 下个方块为逻辑中心
交互功能分3个：
1. 随机函数生成指代方块的字符串-标识符
2. 根据标识符渲染出俄罗斯方块的二维数组
3. 根据坐标将二维数组转换成key:value格式

半秒延迟
Uses half second lock delay.

Game must count down from 3 after you press start, and after you resume a paused game.

速度公式
Time = (0.8-((Level-1)*0.007))^(Level-1)

Tetris © 1985~XXXX Tetris Holding.
Tetris logos, Tetris theme song and Tetriminos are trademarks of Tetris Holding.
The Tetris trade dress is owned by Tetris Holding.
* Licensed to The Tetris Company.
Tetris Game Design by Alexey Pajitnov.
Tetris Logo Design by Roger Dean.
All Rights Reserved.