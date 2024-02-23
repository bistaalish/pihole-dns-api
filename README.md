# PIHole DNS Record Manager

This Node.js application provides endpoints to manage DNS records in a PIHole setup. It allows adding, deleting, and resetting DNS records stored in the `/etc/pihole/home.list` file. Additionally, it restarts the `pihole-FTL` service after each operation to apply the changes.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/pihole-dns-manager.git
```

2. Install Dependencies:

```bash
cd pihole-dns-manager
npm install

```

3. start the server
```
npm start
```

By default, the server runs on port 3000. You can change the port by modifying the `port` variable in `index.js`.

## Usage

The application provides the following endpoints:

*   `POST /add`: Add a DNS record. Send a JSON object with `IP` and `record` fields in the request body.
    
*   `POST /delete`: Delete a DNS record. Send a JSON object with `IP` and `record` fields in the request body.
    
*   `GET /reset`: Reset DNS records to the state stored in `/etc/pihole/home.list.old`.
    
*   `GET /`: Retrieve all DNS records stored in `/etc/pihole/home.list`.

## Example

To add a DNS record:


```bash
curl -X POST -H "Content-Type: application/json" -d '{"IP":"192.168.10.1","record":"test.home.lab"}' http://localhost:3000/add

```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -am 'Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Create a new pull request.