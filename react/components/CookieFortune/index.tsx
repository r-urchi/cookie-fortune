import React, { FC, useEffect, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { useQuery } from 'react-apollo'
import getDocument from './graphql/getDocument.graphql'
import { Button, Spinner, Modal } from 'vtex.styleguide'
import Cookie from '../../../assets/galletita2.png'

interface Field {
    key: string
    value: string
}

const CookieFortune: FC = () => {

    const CSS_HANDLES = [
        'CookieFortuneContainer',
        'CookieFortune',
        'CookieFortuneMessageContainer',
        'CookieFortuneMessage',
        'CookieFortuneLuckyNumber',
        'CookieImage',
        'MessageActive',
    ]
    const handles = useCssHandles(CSS_HANDLES)

    const [message, setMessage] = useState('')
    const [luckyNumber, setLuckyNumber] = useState('')
    const [loadingFortune, setLoadingFortune] = useState(false)
    const [storedFortunes, setStoredFortunes] = useState(null)
    const [shouldFetch, setShouldFetch] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const toggleModal = () => setIsModalOpen(!isModalOpen)

    useEffect(() => {
        const stored = sessionStorage.getItem('cookieFortunes')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setStoredFortunes(parsed)
            } catch (error) {
                console.log('Error', error)
                setStoredFortunes(null)
            }
        } else {
            setShouldFetch(true)
        }
    }, [])

    const { data, loading, error } = useQuery(getDocument, {
        skip: !shouldFetch,
        variables: {
            acronym: 'CF',
            fields: ['CookieFortune'],
            schema: 'Cookie Fortune',
            pageSize: '100',
        },
    })

    useEffect(() => {
        if (!storedFortunes && data?.documents?.length > 0) {
            const items = data?.documents?.map((doc: any) => {
                const item: Record<string, string> = {}
                doc?.fields?.forEach((field: Field) => {
                    if (field?.key === 'CookieFortune') {
                        item[field?.key] = field?.value
                    }
                })
                return item
            })
            sessionStorage.setItem('cookieFortunes', JSON.stringify(items))
        }
    }, [data, storedFortunes])

    const generateLuckyNumber = () => {
        const part1 = Math.floor(Math.random() * 90 + 10)
        const part2 = Math.floor(Math.random() * 90 + 10)
        const part3 = Math.floor(Math.random() * 9000 + 1000)
        return `${part1}-${part2}-${part3}`
    }

    const showRandomFortune = () => {
        setLoadingFortune(true)
        setTimeout(() => {
            const stored = sessionStorage.getItem('cookieFortunes')
            if (!stored) return

            try {
                const list: { CookieFortune: string }[] = JSON.parse(stored)
                if (list?.length === 0) return
                const randomIndex = Math.floor(Math.random() * list.length)
                setMessage(list[randomIndex].CookieFortune)
                setLuckyNumber(generateLuckyNumber())
            } catch (error) {
                console.log('Error', error)
            } finally {
                setLoadingFortune(false)
            }
        }, 500)
    }

    if (!storedFortunes && loading) return <Spinner size={20} />
    if (!storedFortunes && error) return <div>Error. Este dev no fue afortunado.</div>

    return (
        <div className={handles.CookieFortuneContainer}>

            <Button variation="primary" onClick={() => { toggleModal(); showRandomFortune() }} size="regular">
                {!message ? 'Ver tu fortuna' : 'Intentá de nuevo'}
            </Button>

            <Modal isOpen={isModalOpen} onClose={toggleModal} centered  >
                {
                    !loadingFortune && message && luckyNumber ?
                        <div className={handles.CookieFortuneMessageContainer}>

                            <img src={Cookie} alt="Cookie Fortune" className={`${handles.CookieImage} ${!loadingFortune && message && luckyNumber && handles.MessageActive}`} />

                            {!loadingFortune && message && luckyNumber && (
                                <div className={handles.CookieFortune}>
                                    <h3 className={handles.CookieFortuneMessage}>{message}</h3>
                                    <h5 className={handles.CookieFortuneLuckyNumber}>Tu número de la suerte es: <br /> {luckyNumber}</h5>
                                </div>)
                            }
                        </div>
                        :
                        <div className={handles.CookieFortuneMessageContainer}>
                            <Spinner size={30} />
                        </div>
                }
            </Modal>
        </div>
    )
}

export default CookieFortune
