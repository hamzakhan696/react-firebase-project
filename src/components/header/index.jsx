import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doSignOut } from '../../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    return (
        <nav className='flex flex-row gap-x-2 w-full z-20 fixed top-0 left-0 h-12 border-b place-content-center items-center bg-gray-200'>
            {
                userLoggedIn
                    ?
                    <>
                        <button onClick={() => { doSignOut().then(() => { navigate('/login') }) }} className='text-sm text-blue-600 font-medium hover:underline'>Logout</button>
                    </>
                    :
                    <>
                        <Link className='text-sm text-blue-600 font-medium hover:underline' to={'/login'}>Login</Link>
                        <span className="text-sm text-gray-600">|</span>
                        <Link className='text-sm text-blue-600 font-medium hover:underline' to={'/register'}>Register New Account</Link>
                    </>
            }

        </nav>
    )
}

export default Header
