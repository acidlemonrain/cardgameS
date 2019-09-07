import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
var {cards,selectRandom,selectHands,isOutRoom} = require('./api')
@WebSocketGateway()
export class GameGateway  implements OnGatewayInit ,OnGatewayConnection,OnGatewayDisconnect{
  @WebSocketServer() server;
  afterInit() {
  }
  //游戏用户
  users = []
  userUnMatched = []
  //对战组
  usersCombo = []
  usersInfo = []

  configGame(user){
    let { handCards , leftCards } = selectHands(cards);
    let info = {
        id:user.id,
        turn:null,
        winner:null,
        enemyhealth:30,
        minehealth:30,
        enemytablecards:[
        ],
          enemyhandcards:6,
          tablecards:[
          ],
      handcards:handCards,
      leftcards:leftCards
    }
    this.usersInfo.push(info) 
  }

  initGame() {
      let  clock = 30
      console.log('游戏开始初始化');
     //挑选玩家
      let playA = this.userUnMatched[0];
      let playB = this.userUnMatched[this.userUnMatched.length-1];
      //更新数据
      this.usersCombo.push({playA:playA,playB:playB})
      this.userUnMatched=this.userUnMatched.filter(user=>{
        return user.id != playA.id && user.id != playB.id
      })
      //
      this.configGame(playA)
      this.configGame(playB)
      //数据流向用户
      let infoA =  {...this.usersInfo.find((user)=>{
        return user.id == playA.id;
      })}
      let infoB = { ...this.usersInfo.find((user)=>{
      return user.id == playB.id;
     })}
      delete infoA.leftcards
      delete infoB.leftcards
      infoA.turn = infoA.id
      infoB.turn = infoA.id
      infoA.enemyId = infoB.id 
      infoB.enemyId = infoA.id
      let temp = infoA.id
      this.server.to(playA.id).emit('userMatched', infoA);
      this.server.to(playB.id).emit('userMatched',infoB);
      let hourGlass =setInterval(() => {
        if(isOutRoom(this.users,playA.id)||isOutRoom(this.users,playB.id)){
          console.log('有人退出游戏，游戏计时器终止');
         clearInterval(hourGlass);
        }
        clock--;
        if(clock==0){
          clock = 30;
          if(temp == infoA.id){
            temp =infoB.id
          }else{
            temp=infoA.id
          }
        }
        this.server.to(playA.id).emit('hourGlass', {clock:clock,id:temp});
        this.server.to(playB.id).emit('hourGlass', {clock:clock,id:temp});
        console.log(temp);
      }, 1000);
    console.log('初始成功');
    console.log("未匹配："+this.userUnMatched)
    
  }

  async handleConnection(client) {
    //跟新数据
      this.users.push({id:client.id})
      this.userUnMatched.push({id:client.id})
      console.log(this.users.length);
     //游戏初始化
     if(this.userUnMatched.length >= 2){
       console.log("未匹配："+this.userUnMatched);    
        this.initGame( );
     }
  }
  //离线处理
  async handleDisconnect(client) {
    console.log('disconnect');   
      this.users = this.users.filter(user=> user.id != client.id)
      this.userUnMatched = this.userUnMatched.filter(user => user.id != client.id)
      console.log(this.users);
      
  }
  //随从信息交换
	@SubscribeMessage('gameInfo')
	async onChat(client, message) {
    console.log(message);
  //    message = {
  //     id:null,
  //     enemyId:null,
  //     turn:null,
  //     winner:null,
  //     enemyhealth:30,
  //     minehealth:30,
  //     enemytablecards:[
  //   ],
  //   enemyhandcards:6,
  //   tablecards:[
  //   ],
  //   handcards:[
  //   ]
  // }
    var translateMessage = {
      id:message.enemyId,
      enemyId :message.id,
      turn:message.turn,
      winner:message.winner,
      enemyhealth:message.minehealth,
      minehealth:message.enemyhealth,
      enemytablecards:message.tablecards||[],
      tablecards:message.enemytablecards,
      enemyhandcards:message.handcards.length,
      handcards:false
    }
		this.server.to(message.enemyId).emit('gameInfo', translateMessage);
  }
  

 

}
