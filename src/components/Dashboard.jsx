






export default function Dashboard({user}){
  return(
    <>
      <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between rounded-xl bg-white p-6 shadow">
            <div>
              <h1 className="text-3xl font-bold">Welcome Back 👋</h1>

              <p className="mt-2 text-gray-500">
                {user.first_name}, here's your account overview.
              </p>
            </div>

            <img
              src="https://i.pravatar.cc/100"
              alt=""
              className="h-16 w-16 rounded-full"
            />
          </div>

          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Orders</p>

              <h2 className="mt-2 text-3xl font-bold">12</h2>

              <span className="text-green-500">+2 this month</span>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Wishlist</p>

              <h2 className="mt-2 text-3xl font-bold">8</h2>

              <span className="text-indigo-500">Saved products</span>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <p className="text-gray-500">Total Spent</p>

              <h2 className="mt-2 text-3xl font-bold">$1,280</h2>

              <span className="text-orange-500">Lifetime purchases</span>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Orders</h2>

              <button className="text-indigo-600 hover:underline">
                View All
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Price</th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b">
                    <td className="py-4">#1024</td>
                    <td>2026-07-27</td>

                    <td>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        Delivered
                      </span>
                    </td>

                    <td>$230</td>
                  </tr>

                  <tr className="border-b">
                    <td className="py-4">#1023</td>
                    <td>2026-07-21</td>

                    <td>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                        Pending
                      </span>
                    </td>

                    <td>$110</td>
                  </tr>

                  <tr>
                    <td className="py-4">#1022</td>
                    <td>2026-07-14</td>

                    <td>
                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                        Cancelled
                      </span>
                    </td>

                    <td>$60</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
    </>
  )
}
