import Mock from 'mockjs'
const Random = Mock.Random
export function getMockChartData (len) {
  return new Promise((resolve) => {
    let arr = []
    for (let i = 0; i < len; i++) {
      arr.push(getItem(i))
    }
    const mapArr = arr.map((item) => {
      return item.praise
    })
    const average = Random.integer(Math.min(...mapArr), Math.max(...mapArr))
    resolve({
      code: 200,
      data: {
        list: arr,
        average
      }
    })
  })
}
function getItem (index) {
  return {
    name: `书${index + 1}`,
    praise: Random.integer(0, 100)
  }
}
