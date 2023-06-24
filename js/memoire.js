(function () {
    'use strict'

    window.addEventListener('load', function load () {
        window.removeEventListener('load', load, false)
        const timeScoreContainer = document.querySelector('#timeScoreContainer')
        const cardsContainer = document.querySelector('#cardsContainer')
        const buttonPartie = document.querySelector('#buttonsPartie button')
        const theme = document.querySelector('#theme')
        const bestTime = []

        let score = 0
        let clickCardCount = 0
        let firstCard = null
        let secondCard = null
        let interval
        let currentAudio

        const listcards = [
            { name: 'image0001', image: 'image0001.png' },
            { name: 'image0002', image: 'image0002.png' },
            { name: 'image0003', image: 'image0003.png' },
            { name: 'image0004', image: 'image0004.png' },
            { name: 'image0005', image: 'image0005.png' },
            { name: 'image0006', image: 'image0006.png' },
            { name: 'image0007', image: 'image0007.png' },
            { name: 'image0008', image: 'image0008.png' }
        ]

        function createElement (tagName, attributes) {
            const element = document.createElement(tagName)
            attributes.forEach(function (attribut) {
                element.setAttribute(attribut.name, attribut.value)
            })
            return element
        }

        function createRandomCard () {
            const shuffledCards = []
            const cards = listcards.concat(listcards)
            while (cards.length > 0 && theme.value !== 'Choose theme') {
                const randomIndex = Math.floor(Math.random() * cards.length)
                const divElement = createElement('div', [{ name: 'class', value: 'card' }])
                const frontCard = createElement('img', [{ name: 'src', value: `image/${theme.value}/${cards[randomIndex].image}` },
                    { name: 'alt', value: `${cards[randomIndex].name}` },
                    { name: 'class', value: 'front-face' }])
                const backCard = createElement('img', [{ name: 'src', value: 'image/inconnu.png' },
                    { name: 'alt', value: 'image inconnu' },
                    { name: 'class', value: 'back-face' }])
                shuffledCards.push(randomIndex)
                cards.splice(randomIndex, 1)
                divElement.appendChild(frontCard)
                divElement.appendChild(backCard)
                cardsContainer.appendChild(divElement)

                setTimeout(function () {
                    divElement.classList.add('is-flipped')
                    divElement.addEventListener('click', handleCardClick)
                }, 1000)
            }
        }
        function handleCardClick () {
            this.classList.toggle('is-flipped')

            clickCardCount++

            if (clickCardCount % 2 === 0) {
                const allCards = document.querySelectorAll('.card')
                allCards.forEach(card => {
                    card.removeEventListener('click', handleCardClick)
                })
            }

            if (!firstCard) {
                firstCard = this.firstChild
                firstCard.parentNode.removeEventListener('click', handleCardClick)
            } else {
                secondCard = this.firstChild
                secondCard.parentNode.removeEventListener('click', handleCardClick)

                setTimeout(function () {
                    checkForMatch()
                }, 1000)
            }
        }

        function checkForMatch () {
            if (firstCard.getAttribute('src') !== secondCard.getAttribute('src')) {
                firstCard.parentNode.classList.toggle('is-flipped')
                secondCard.parentNode.classList.toggle('is-flipped')
                firstCard.parentNode.addEventListener('click', handleCardClick)
                secondCard.parentNode.addEventListener('click', handleCardClick)
            } else {
                firstCard.parentNode.classList.toggle('is-found')
                secondCard.parentNode.classList.toggle('is-found')
                const audioCardFound = new Audio('song/cardFound.wav')
                audioCardFound.play()
                score++
                checkWin()
            }

            firstCard = null
            secondCard = null

            setTimeout(function () {
                const allCards = document.querySelectorAll('.is-flipped')
                allCards.forEach(card => {
                    card.addEventListener('click', handleCardClick)
                })
            }, 500)
        }

        function startTimer () {
            let seconds = 0
            let minutes = 0
            timeScoreContainer.innerHTML = '<img src="./image/timer.png" alt="clock"><div>TIME: 00:00</div>'
            timeScoreContainer.innerHTML += '<img src="./image/target.png" alt="score"><div>SCORE: 0</div>'

            interval = setInterval(function () {
                seconds += 1
                if (seconds >= 60) {
                    minutes += 1
                    seconds = 0
                }
                const displayedSeconds = seconds < 10 ? `0${seconds}` : seconds
                const displayedMinutes = minutes < 10 ? `0${minutes}` : minutes
                timeScoreContainer.value = displayedMinutes + displayedSeconds
                timeScoreContainer.innerHTML = `<img src="./image/timer.png" alt="clock"><div>TIME: ${displayedMinutes}:${displayedSeconds}</div>`
                timeScoreContainer.innerHTML += `<img src="./image/target.png" alt="score"><div>SCORE: ${score}</div>`

                if (score === 8) {
                    timeScoreContainer.innerHTML = `<div>TIME: ${displayedMinutes}:${displayedSeconds}</div>`
                    timeScoreContainer.innerHTML += `<div>SCORE: ${score}</div>`
                }
            }, 1000)
        }

        function playSound (audioName, loop) {
            const audio = new Audio(audioName)
            currentAudio = audio
            audio.loop = loop
            return audio
        }

        buttonPartie.addEventListener('click', function (event) {
            if (theme.value !== 'Choose theme') {
                if (buttonPartie.textContent === 'Arrêter la partie') {
                    buttonPartie.textContent = 'Nouvelle partie'
                    clearInterval(interval)
                    cardsContainer.classList.remove('startPart')
                    currentAudio.pause()
                    cardsContainer.innerHTML = ''
                    window.location.reload()
                } else {
                    cardsContainer.style.alignSelf = 'unset'

                    cardsContainer.innerHTML = ''
                    cardsContainer.style.display = 'flex'
                    cardsContainer.classList.remove('checkWin', 'startPart')
                    startTimer()
                    createRandomCard()
                    playSound('song/game.wav', true).play()
                    buttonPartie.textContent = 'Arrêter la partie'
                    score = 0
                }
            } else {
                cardsContainer.innerHTML = '<div style="font-size: 25px;" >VOUS DEVEZ CHOISIR UN THEME D\'ABORD!<div>'
            }
        })

        function checkWin () {
            if (score === 8) {
                setTimeout(function () {
                    const divToSpanElement = timeScoreContainer.innerHTML.replaceAll('div', 'span')
                    timeScoreContainer.innerHTML = ''
                    cardsContainer.innerHTML = ''
                    currentAudio.pause()
                    buttonPartie.textContent = 'Nouvelle partie'
                    cardsContainer.style.alignSelf = 'Center'
                    cardsContainer.classList.toggle('checkWin')
                    cardsContainer.style.display = 'block'
                    cardsContainer.innerHTML = '<h2>CONGRATULATIONS!<h2>'
                    cardsContainer.innerHTML += divToSpanElement
                    displayBestTime()
                    clearInterval(interval)
                }, 1000)
            }
        }

        function displayBestTime () {
            bestTime.push(parseInt(timeScoreContainer.value))

            const firstTwoDigits = timeScoreContainer.value.substr(0, 2)
            const remainingStr = timeScoreContainer.value.substr(2)

            if (bestTime[1] < bestTime[0]) {
                bestTime.splice(0, 1)
                cardsContainer.innerHTML += `<h2>${firstTwoDigits}:${remainingStr} IS THE NEW RECORD TIME ACHIEVED!</h2>`
            } else {
                bestTime.splice(1)
            }
        }
    }, false)
})()
