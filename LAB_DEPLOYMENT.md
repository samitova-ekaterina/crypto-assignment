# Лабораторная: UUPS-прокси для MyToken (V1 → V2)

## Артефакты в репозитории

| Файл | Назначение |
|------|------------|
| `contracts/MyTokenV1.sol` | Логика ERC20 V1 (initializer, mint, UUPS) |
| `contracts/MyTokenProxy.sol` | ERC1967-прокси (делегирование в implementation) |
| `contracts/MyTokenV2.sol` | Логика V2 + `version()` → `"V2"` |
| `scripts/deploy-proxy.js` | Деплой V1 + прокси |
| `scripts/upgrade-proxy.js` | Деплой V2 + `upgradeToAndCall` на прокси |

Старый `MyToken.sol` без прокси оставлен как база из предыдущей работы; для задания используйте **адрес прокси** как адрес токена.

## Локально (Hardhat)

```bash
npm install
npm test
```

Деплой на встроенную сеть (по умолчанию Hardhat):

```bash
npx hardhat run scripts/deploy-proxy.js
```

Скопируйте из вывода строку `PROXY_ADDRESS=0x...` в файл `.env`.

Апгрейд:

```bash
npx hardhat run scripts/upgrade-proxy.js
```

## Sepolia + MetaMask (для отчёта)

1. Создайте `.env`:

   - `SEPOLIA_RPC_URL` — URL RPC (Infura, Alchemy и т.д.)
   - `SEPOLIA_PRIVATE_KEY` — ключ кошелька с тестовым ETH (без `0x` или с — как принимает ваш провайдер)
   - после первого деплоя: `PROXY_ADDRESS=0x...` (только адрес **прокси**)

2. Деплой на Sepolia:

   ```bash
   npx hardhat run scripts/deploy-proxy.js --network sepolia
   ```

3. В MetaMask импортируйте **тот же** аккаунт, что и `SEPOLIA_PRIVATE_KEY`, или переведите роль owner другому кошельку (тогда для апгрейда нужен именно owner).

4. **Mint / transfer через прокси:** в MetaMask → «Импорт токена» → вставьте **адрес прокси** (не implementation). Вызовите `mint` / `transfer` через «Взаимодействие с контрактом» в эксплорере (Etherscan **Write Contract**) или через Remix, подставив ABI из артефактов `artifacts/contracts/MyTokenV1.sol/MyTokenV1.json`.

5. Апгрейд (от owner):

   ```bash
   npx hardhat run scripts/upgrade-proxy.js --network sepolia
   ```

6. Проверка: `Read Contract` → `balanceOf`, `version` на **адресе прокси**; балансы должны совпасть с состоянием до апгрейда.

## Что приложить к отчёту (ссылки и скриншоты)

Замените плейсхолдеры на свои tx / адреса из Sepolia Etherscan.

| Требование | Что снять / вставить |
|------------|----------------------|
| Mint на V1 через прокси | Ссылка на tx `mint`, скрин лога / Events |
| Transfer на V1 через прокси | Ссылка на tx `transfer` |
| Успешный апгрейд | Ссылка на tx `upgradeToAndCall`, скрин Internal Txns / Logs |
| Балансы после апгрейда | Скрин `balanceOf` для тех же адресов до/после |
| `version()` после апгрейда | Скрин Read Contract → `version` = `V2` |

Пример формата ссылок (подставьте свои хэши):

- `https://sepolia.etherscan.io/tx/<TX_HASH>`
- `https://sepolia.etherscan.io/address/<PROXY_ADDRESS>#readContract`

Логи из консоли после `deploy-proxy.js` и `upgrade-proxy.js` можно вставить в отчёт как текст.
