let app = new Vue({
    el: '#app',
    data: {
      formulaStack: [0],
      resultFontSize: '56',
      formulaFontSize: '16',
      isReset: false
    },
    computed: {
      total () {
        if (this.formulaStack.length == 1) {
          if (!isFinite(this.formulaStack[0])) {
            return '無法除以零'
          } 
          return this.formulaStack[0]
        } else {
          let i = this.formulaStack.length
          while (i--) {
            if (this.isNumber(+this.formulaStack[i])) {
              return this.formulaStack[i]
            }
          }
        }
      },
      formula () {
        return this.formulaStack.reduce((prev, element) => {
          if (this.isNumber(element) && !isFinite(element)) {
            return '無法除以零'
          } else {
            return `${prev} ${this.isNumber(element) ? this.addCommaFormat(element) : element}`
          }
        }, '') 
      }
    },
    updated () {
      if (this.isReset) {
        this.isReset = false
        this.$refs.calculatorTotal.style.fontSize = `${this.resultFontSize}px`
        this.$refs.calcualtorFormula.style.fontSize = `${this.formulaFontSize}px`
      } else {
        let totalFontSize = window.getComputedStyle(this.$refs.calculatorTotal).getPropertyValue('font-size').replace('px', '')
        let formulaFontSize = window.getComputedStyle(this.$refs.calcualtorFormula).getPropertyValue('font-size').replace('px', '')
  
        // 當總寬度大於 container 寬度時 要限縮字體大小
        while (this.$refs.calculatorTotal.offsetWidth > 290) {
          totalFontSize--
          this.$refs.calculatorTotal.style.fontSize = (totalFontSize + 'px')
        }
  
        while (this.$refs.calcualtorFormula.offsetWidth > 290) {
          formulaFontSize--
          this.$refs.calcualtorFormula.style.fontSize = (formulaFontSize + 'px')
        }
      }
    },
    methods: {
      addNumber (number) {
        const topValue = this.top()
        if (this.isNumber(topValue)) {
          if (+topValue == 0) {
            this.pop()
            this.push(topValue.toString().includes('.') ? `${topValue}${number}` : `${number}`)
          } else {
            this.pop()
            this.push(`${topValue}${number}`)
          }
        } else {
          this.$refs.calculatorTotal.style.fontSize = `${this.resultFontSize}px`
          this.push(number)
        }
      },
      addDoubleZero () {
        const topValue = this.top()
        if (this.isNumber(topValue)) {
          if (+topValue !== 0 || topValue.includes('.')) {
            this.pop()
            this.push(`${topValue}00`)
          } 
        }
      },
      addOperation (operation) {
        const topValue = this.top()
        if (!this.isNumber(topValue)) {
          this.pop()
          this.push(operation)
        } else {
          this.push(operation)
        }
      },
      showResult () {
        this.isShowResult = true
      },
      calculateTotal () {
        let total = 0
        let operation = '+'
        this.formulaStack.forEach(element => {
          if (this.isNumber(element)) {
            total = this.calculate(total, operation, element)
          } else {
            operation = element
          }
        })
        // if (isFinite(total)) {
        //   this.formulaStack = [total]
        // } else { // 如果是 1 / 0 情況發生
        //   this.formulaStack = ['無法除以零']
        // }
        this.formulaStack = [total]
      },
      calculate (total, operation, value) {
        let result
        if (operation == '+') {
          return new Decimal(total).plus(value)
        } else if (operation == '-') {
          return new Decimal(total).minus(value)
        } else if (operation == 'x') {
          return new Decimal(total).times(value)
        } else if (operation == '÷') {
          // 判斷兩數是否能整除，若不行，則取精準數道小數點後第16位 (待做)
          return new Decimal(total).dividedBy(value)
        } else {
          return parseFloat(total)
        }
      },
      deleteNumber () {
        let topValue = this.top()
        if (this.isNumber(topValue)) {
          if (topValue.toString().length == 1) {
            topValue = '0'
          } else {
            const splitPosition = topValue.toString().length - 1
            topValue = topValue.toString().substring(0, splitPosition)
          }
          this.formulaStack.splice(this.formulaStack.length - 1, 1, topValue)
        }
      },
      addDot() {
        let topValue = this.top()
        if (this.isNumber(topValue)) {
          this.pop()
          this.push(`${topValue}.`)
        }
      },
      reset () {
        this.formulaStack = [0]
        this.isReset = true
      },
      // stack array operation 
      top () {  // 取得 stack 最上層的數值
        return this.formulaStack[this.formulaStack.length - 1]
      },
      push (value) {
        Vue.set(this.formulaStack, this.formulaStack.length, value)
      },
      pop () {
        let value = this.formulaStack[this.formulaStack.length - 1]
        this.formulaStack.splice(this.formulaStack.length - 1, 1)
        return value
      },
      isNumber (value) {
        return !isNaN(value)
      },
      addCommaFormat (value) {
        return value.toString().replace(/^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/, function (all, pre, groupOf3Digital) {
          return pre + groupOf3Digital.replace(/\d{3}/g, ',$&');
        })
      },
      isPrimeNumber (num) {
        // 網路上查的，但效率並不好
        return !/^.?$|^(.. ?)\1 $/.test(Array(num).join('1'))
      }
    },
    filters: {
      commaFormat (value) { // 加上千分位符號
        
        return value.toString().replace(/^(-?\d+?)((?:\d{3})+)(?=\.\d+$|$)/, function (all, pre, groupOf3Digital) {
          return pre + groupOf3Digital.replace(/\d{3}/g, ',$&');
        })
      }
    }
  })