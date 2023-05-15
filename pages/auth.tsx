import axios, { AxiosError }     from 'axios';
import { useState, useCallback } from 'react';
import { NextPageContext } from "next";
import {getSession, signIn} from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

import Input                        from "@/components/Input";
import { Toasts, useToastControls } from "@/components/Toasts";
import { useRouter }                from "next/router";

interface ValidationError {
  message: string;
  error: Record<string, string[]>
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {}
  }
}

const Auth = () => {
  const { show } = useToastControls();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const callbackUrl = (router.query?.callbackUrl as string) ?? "/profiles";

  const [variant, setVariant] = useState('login');

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) => currentVariant === 'login' ? 'register' : 'login');
  }, []);

  const login = useCallback(async () => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        //callbackUrl: '/profiles'
      });
      //throw new Error();
      if (result?.error) {
        setError(result.error);
        show('toast-error');
      } else {
        await router.push(callbackUrl);
      }
    } catch(error) {
      console.log(error);
    }
  }, [email, password]);

  const register = useCallback(async () => {
    try {
      await axios.post('/api/register', {
        email,
        name,
        password
      });
      await login();
    } catch (error) {
      if (axios.isAxiosError<ValidationError, Record<string, unknown>>(error)){
        const message = error?.response?.data?.error.toString() || 'Unknown error';
        setError( message );
        show( 'toast-error' );
        console.log( error )
      }
    }
  }, [email, name, password, login]);
  
  return (
    <div className="relative h-full w-full bg-[url('/images/hero.jpg')] bg-center bg-fixed bg-cover">
      <div id="toasts-portal"></div>
      <Toasts
        uniqueId="toast-error"
        config={ { duration: 6500 } }
        className="toast-pink"
      >
        { error }
      </Toasts>
      <div className="bg-black w-full h-full lg:bg-opacity-50">
        <div className="px-12 py-5">
          <img src="/images/logo.png" alt="Logo" className="h-12"/>
        </div>
        <div className="flex justify-center">
          <div className="bg-black bg-opacity-70 px-8 py-16 self-center mt-2 lg:w-2/5 lg:max-w-md rounded-md w-full">
            <h1 className="text-white text-4xl mb-8 font-semibold">
              { variant === 'login' ? 'Sign in' : 'Register' }
            </h1>
            <div className="flex flex-col gap-4">
              { variant === 'register' && (
                <Input
                  label="Username"
                  onChange={ (ev: any) => setName( ev.target.value ) }
                  id="name"
                  type="text"
                  value={ name }
                />
              ) }
              <Input
                label="Email"
                onChange={ (ev: any) => setEmail( ev.target.value ) }
                id="email"
                type="email"
                value={ email }
              />
              <Input
                label="Password"
                onChange={ (ev: any) => setPassword( ev.target.value ) }
                id="password"
                type="password"
                value={ password }
              />
            </div>
            <button onClick={ variant === 'login' ? login : register }
                    className="bg-red-600 py-3 text-white rounded-md w-full mt-10 hover:bg-red-700 transition">
              { variant === 'login' ? 'Login' : 'Sign up' }
            </button>
            <div className="flex flex-row items-center gap-4 mt-8 justify-center">
              <div onClick={ () => signIn( 'google', { callbackUrl: '/profiles' } ) }
                   className="
                  w-10
                  h-10
                  bg-white
                  rounded-full
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  hover:opacity-10
                  transition
                "
              >
                <FcGoogle size={ 30 }/>
              </div>
              <div
                onClick={ () => signIn( 'github', { callbackUrl: '/profiles' } ) }
                className="
                  w-10
                  h-10
                  bg-white
                  rounded-full
                  flex
                  items-center
                  justify-center
                  cursor-pointer
                  hover:opacity-10
                  transition
                "
              >
                <FaGithub size={ 30 }/>
              </div>
            </div>
            <p className="text-neutral-500 mt-12">
              { variant === 'login' ? 'First time using Netflix?' : 'Already have an account.' }
              <span onClick={ toggleVariant } className="text-white ml-1 hover:underline cursor-pointer">
                { variant === 'login' ? 'Create an account' : 'Login' }
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
