import Layout from "../component/Layout";
import Hero from "../component/Hero";
import ROUTES from "../constants/routes";

function Home() {
  return (
    <>
      <Layout>

      <main>

        {/* Hero Banner */}
        <Hero />

        {/* Featured Categories */}
        <section className="container py-5">

          <div className="text-center mb-5">
            <h2 className="fw-bold">Shop by Category</h2>
            <p className="text-muted">
              Discover our exciting Mario-themed collections.
            </p>
          </div>

          <div className="row g-4">

            <div className="col-md-3">
              <div className="card shadow border-0 h-100 text-center">
                <div className="card-body">
                  <div style={{ fontSize: "60px" }}>🎮</div>
                  <h5 className="mt-3">Gaming</h5>
                  <p className="text-muted">
                    Nintendo games and consoles.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow border-0 h-100 text-center">
                <div className="card-body">
                  <div style={{ fontSize: "60px" }}>🧸</div>
                  <h5 className="mt-3">Collectibles</h5>
                  <p className="text-muted">
                    Limited edition figures and toys.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow border-0 h-100 text-center">
                <div className="card-body">
                  <div style={{ fontSize: "60px" }}>👕</div>
                  <h5 className="mt-3">Apparel</h5>
                  <p className="text-muted">
                    T-shirts, hoodies and accessories.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card shadow border-0 h-100 text-center">
                <div className="card-body">
                  <div style={{ fontSize: "60px" }}>🎁</div>
                  <h5 className="mt-3">Gifts</h5>
                  <p className="text-muted">
                    Perfect gifts for every Mario fan.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* Why Shop With Us */}
        <section className="bg-light py-5">

          <div className="container">

            <div className="text-center mb-5">

              <h2 className="fw-bold">
                Why Choose MarioMart?
              </h2>

              <p className="text-muted">
                We bring quality products with excellent customer service.
              </p>

            </div>

            <div className="row text-center">

              <div className="col-md-4 mb-4">

                <h1>🚚</h1>

                <h4>Fast Delivery</h4>

                <p className="text-muted">
                  Receive your favourite products quickly with reliable
                  shipping across Singapore.
                </p>

              </div>

              <div className="col-md-4 mb-4">

                <h1>🔒</h1>

                <h4>Secure Shopping</h4>

                <p className="text-muted">
                  Your personal information and payments are always protected.
                </p>

              </div>

              <div className="col-md-4 mb-4">

                <h1>⭐</h1>

                <h4>Premium Quality</h4>

                <p className="text-muted">
                  Carefully selected authentic gaming merchandise.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Newsletter */}
        <section
          className="py-5 text-center text-white"
          style={{
            background: "linear-gradient(135deg,#E52521,#FF7B00)"
          }}
        >

          <div className="container">

            <h2 className="fw-bold">
              Stay Updated
            </h2>

            <p className="mb-4">
              Subscribe to receive exclusive offers and the latest products.
            </p>

            <div
              className="row justify-content-center"
            >

              <div className="col-md-6">

                <div className="input-group">

                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="Enter your email"
                  />

                  <button
                    className="btn btn-warning fw-bold"
                  >
                    Subscribe
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

      </Layout>
    </>
  );  
}

export default Home;