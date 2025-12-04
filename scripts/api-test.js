import axios from 'axios';
import chalk from 'chalk';
const BASE_URL = 'http://localhost:3000/api';

const testUser = {
    email: `tester_${Date.now()}@example.com`,
    password: 'passwordRahasia123',
    name: 'John Doe'
};

const logPass = (msg) => console.log(chalk.green(`✅ [PASS] ${msg}`));
const logFail = (msg, err) => {
    console.log(chalk.red(`❌ [FAIL] ${msg}`));
    if(err.response) {
        console.log(chalk.red(`       Status: ${err.response.status}`));
        console.log(chalk.red(`       Data: ${JSON.stringify(err.response.data)}`));
    } else {
        console.log(chalk.red(`       Error: ${err.message}`));
    }
};
const logInfo = (msg) => console.log(chalk.blue.bold(`\n🔍 ${msg}`));

async function runTests() {
    console.log(chalk.yellow.bold('========================================='));
    console.log(chalk.yellow.bold('🚀  MEMULAI AUTOMATED API TESTING'));
    console.log(chalk.yellow.bold('========================================='));

try {
    logInfo('Mencoba Register User Baru...');
    const res = await axios.post(`${BASE_URL}/auth/register`, testUser);
    if (res.status === 200 || res.status === 201) {
        logPass(`Register Berhasil! Email: ${testUser.email}`);
    }
} catch (error) {
    logFail('Gagal melakukan Register', error);
}

try {
    logInfo('Mencoba Login...');
    const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
    });
    
    if (res.status === 200) {
        if (res.data.token) {
        logPass('Login Berhasil & Token Diterima.');
    } else {
        logPass('Login Berhasil (Info: Token tidak ditemukan di response).');
        }
    }
} catch (error) {
    logFail('Gagal melakukan Login', error);
}

try {
    logInfo('Mencoba Mengambil Data Produk...');
    const res = await axios.get(`${BASE_URL}/products`);
    
    if (res.status === 200) {
        const jumlah = Array.isArray(res.data) ? res.data.length : 0;
        logPass(`Sukses ambil data. Total Produk: ${jumlah}`);
    }
} catch (error) {
    logFail('Gagal mengambil data produk', error);
}

    console.log(chalk.yellow.bold('\n🏁  PENGUJIAN SELESAI.'));
}

runTests();