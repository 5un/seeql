export const renderHintColumnValueBar = (Element, self, data) => {
  var container = document.createElement("div")
  container.style.position = 'relative'
  container.style.width = '200px'
  container.style.height = '20px'
  container.style.border = '1px solid white'

  var bgBar = document.createElement("div")
  bgBar.style.position = 'absolute'
  bgBar.style.left = 0
  bgBar.style.top = 0
  bgBar.style.width = '200px'
  bgBar.style.height = '20px'

  bgBar.style.backgroundColor = '#fefefe'
  var valueBar = document.createElement("div")
  valueBar.innerHTML = `${data.text} ${data.count}`
  valueBar.style.position = 'absolute'
  valueBar.style.left = 0
  valueBar.style.top = 0
  valueBar.style.width = (data.count * 200 / data.totalCount) + 'px'
  valueBar.style.height = '20px'
  valueBar.style.backgroundColor = '#F6CCD1'
  valueBar.style.color = '#222222'

  container.appendChild(bgBar)
  container.appendChild(valueBar)

  Element.appendChild(container)
}

export const renderHintIdentifierItem = (Element, self, data) => {
  //TODO: render and icon and a text
}

