function TradePanel() {

  return (
    <section className="trade-panel card shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div className="trade-panel-label">New transaction</div>
            <h1 className="trade-panel-title">Trade a Solana token</h1>
            <p className="trade-panel-description mb-0">
              Enter a token address and configure your trade.
            </p>
          </div>
          <span className="badge rounded-pill text-bg-secondary">
            Paper Mode
          </span>
        </div>
        <form>
          <div className="mb-3">
            <label htmlFor="token-address" className="form-label">
              Token address
            </label>
            <input
              id="token-address"
              className="form-control token-address-input"
              type="text"
              placeholder="Enter Solana token address"
            />
            <div className="form-text">
              Paste the contract address of the token you want to trade.
            </div>
          </div>
          <div className="d-flex flex-wrap gap-4 mb-3">
            <div>
              <label htmlFor="trade-amount" className="form-label">
                Buy amount
              </label>

              <div className="input-group">
                <input
                  id="trade-amount"
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.50"
                />
                <span className="input-group-text">SOL</span>
              </div>
            </div>

            <div>
              <label htmlFor="slippage" className="form-label">
                Slippage
              </label>

              <div className="input-group">
                <input
                  id="slippage"
                  className="form-control"
                  type="number"
                  min="0"
                  step="0.1"
                  defaultValue="5"
                />
                <span className="input-group-text">%</span>
              </div>
            </div>
          </div>
          <div className="auto-sell-panel mb-4 compact-input-box">
            <div className="form-check form-switch">
              <input
                id="auto-sell"
                className="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label htmlFor="auto-sell" className="form-check-label">
                Automatically sell after a delay
              </label>
            </div>
            <div className="mt-3">
              <label htmlFor="sell-delay" className="form-label">
                Sell delay
              </label>
              <div className="input-group compact-input">
                <input
                  id="sell-delay"
                  className="form-control"
                  type="number"
                  min="1"
                  placeholder="10"
                  disabled
                />
                <span className="input-group-text">minutes</span>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-3">
            <button
              className="btn btn-outline-success flex-grow-1 py-2"
              type="button"
            >
              Buy Token
            </button>
            <button
              className="btn btn-outline-danger flex-grow-1 py-2"
              type="button"
            >
              Sell Token
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default TradePanel;
