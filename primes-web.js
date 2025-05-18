/*
    Copyright (C) 2025 Alpar Duman
    This file is part of primes-web.

    primes-web is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as
    published by the Free Software Foundation.

    primes-web is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with primes-web. If not, see
    <https://github.com/AlparDuman/primes-web/blob/main/LICENSE>
    else <https://www.gnu.org/licenses/>.
*/

class primes_web {

    isPrime( number ) {
        if ( number < 2 ** 32 )
            return isPrimeSieveEratosthenes( number );
        else if ( number < Number.MAX_SAFE_INTEGER )
            return isPrimeTrialDivision( number );
        else
            throw Error( `The number used for the check exceeds the maximum safe integer` );
    }

    isPrimeTrialDivision( number ) {
        if ( number > 2 && number % 2 == 0 || number < 2 )
            return false;
        const number_sqrt = Math.sqrt(number);
        for ( let test = 3; test <= number_sqrt; test += 2 )
            if ( number % test == 0 )
                return false;
        return true;
    }

    isPrimeSieveEratosthenes( number ) {
        if ( number < 2 ) return false;
        const sieveField = new Array( number + 1 ).fill( true );
        sieveField[ 0 ] = sieveField[ 1 ] = false;
        const number_sqrt = Math.sqrt(number);
        for ( let next = 2; next <= number_sqrt; next++ )
            if ( sieveField[ next ] )
                for ( let multiple = next * 2; multiple <= number; multiple += next )
                    sieveField[ multiple ] = false;
        return sieveField[ number ];
    }
}

