var hashChange = require('./hashChange')

function SScroll(options) {
  options = options || {}
  this.options = {
    gapX:     options.gapX     || 40,
    gapY:     options.gapY     || 40,
    duration: options.duration || 500,
    easing:   options.easing   || function (t) { return t*(2-t) }
  }

  // こっそりhashが書き換えられないならやめておく
  if (history.replaceState) {
    hashChange.addListener(this._scrollByHash.bind(this))
  }
  return this
}

SScroll.prototype = {
  constructor:   SScroll,
  _scrollByHash: _scrollByHash,
  _scrollTo:     _scrollTo,
  _modifyHash:   _modifyHash
}

function _modifyHash(hash) {
  history.pushState(null, null, hash)
}

function _scrollByHash(hash) {
  var destEl = document.getElementById(hash.slice(1))
  if (!destEl) {
    return
  }
  if (destEl.classList.contains('sscroll-ignore')) {
    return
  }
  this._scrollTo(0, destEl.getBoundingClientRect().top, this.options)
}

function _scrollTo(x, y, options) {
  var duration = options.duration,
      easing   = options.easing
  x -= options.gapX
  y -= options.gapY

  var frame = null
  var fromX = window.scrollX || window.pageXOffset,
      fromY = window.scrollY || window.pageYOffset,
      startTime = Date.now()

  if (frame) {
    cancelAnimationFrame(frame)
  }

  frame = requestAnimationFrame(__step)

  function __step() {
    var time = Date.now(),
        val,
        curX, curY

    var elapsed = (time - startTime) / duration
    elapsed = elapsed > 1 ? 1 : elapsed
    val = easing(elapsed)

    curX = fromX + (x - fromX) * val
    curY = fromY + (y - fromY) * val

    window.scrollTo(curX, curY)

    if (curX === x && curY === y) {
      cancelAnimationFrame(frame)
      fromX = fromY = startTime = frame = null
      return
    }

    frame = requestAnimationFrame(__step)
  }
}

module.exports = SScroll;
