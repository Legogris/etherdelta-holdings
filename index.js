const request = window.superagent;

const cleanHex = s => s.startsWith('0x')
    ? s.slice(2).toLowerCase()
    : s.toLowerCase();

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const getTokens = () =>
  request.get('https://raw.githubusercontent.com/etherdelta/etherdelta.github.io/master/config/main.json')
    .set('Accept', 'application/json')
    .then(res => JSON.parse(res.text).tokens)

const getTokenBalance = (token, account) =>
  request.get('https://api.etherscan.io/api?module=proxy&action=eth_Call&to=0x8d12a197cb00d4747a1fe03395095ce2a5cc6819&data=0xf7888aec000000000000000000000000' + cleanHex(token) + '000000000000000000000000'+ cleanHex(account) +'&apikey=BFMHBARES7AVIUIZNWCBTFGANGS71HC7JF')
    .then(res => res.body.result);

const addResult = (token, balance) => {
  const tr = document.createElement('tr');
  const tdName = document.createElement('td');
  const tdAddress = document.createElement('td');
  const tdBalance = document.createElement('td');
  const tdRawBalance = document.createElement('td');
  tdName.textContent = token.name;
  tdAddress.textContent = token.addr;
  tdRawBalance.textContent = balance;
  tdBalance.textContent = parseInt(balance, 16) / Math.pow(10, token.decimals);
  tr.appendChild(tdName);
  tr.appendChild(tdAddress);
  tr.appendChild(tdBalance);
  tr.appendChild(tdRawBalance);
  document.getElementById('result-table').appendChild(tr);
}

async function getBalances(account) {
  const tokens = await getTokens();
  const balances = [];
  for (let i in tokens) {
    const token = tokens[i];
    const balance = await getTokenBalance(token.addr, account);
    if (parseInt(balance)) {
      console.log(token.name, balance);
      addResult(token, balance);
    }
    balances.push(balance);
    await sleep(61);
  }
  return balances;
};

const run = (account) => {
  document.getElementById('loading-indicator').className = 'loading';
  getBalances(account)
    .catch(err => {
      console.error(err);
      document.getElementById('loading-indicator').className = '';
    })
    .then(r => {
      document.getElementById('loading-indicator').className = '';
      console.log('DONE');
      console.log(r);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form-1').onsubmit = e => {
    e.preventDefault();
    const addr = document.getElementById('input-account').value;
    run(addr);
  };
});
