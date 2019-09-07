var cards =[]
for (let index = 0; index < 35; index++) {

  var card = {
    id:index,
    name :'战士'+index+'号',
    attack:Math.floor(Math.random()*8)+3,
    arm:Math.floor(Math.random()*8)+3,
    health:Math.floor(Math.random()*5)+5,
  }
  cards.push(card)
}

var selectRandom = (cards) =>{
    let index = Math.floor(Math.random()*this.cards.length)
    return cards[index]
} 
var selectHands = (cards) =>{
  
  let start = Math.ceil(Math.random()*(this.cards.length-10))
  let handCards = []
  let left = cards
  for (let index = 0; index < 7; index++) {
     handCards.push(cards[index+start]);
  }
  handCards.forEach(hand=>{
      left = left.filter(card =>{
        return card != hand
      })
  })
  return {
    handCards :handCards,
    leftCards: left
  }
}
var isOutRoom = (users,id)=>{
    return !users.map(user=>user.id).includes(id)
} 
module.exports.cards = cards
module.exports.selectRandom = selectRandom
module.exports.selectHands = selectHands
module.exports.isOutRoom = isOutRoom