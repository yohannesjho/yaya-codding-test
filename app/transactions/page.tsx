"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  cause: string;
  createdAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?p=${page}`);
      const data = await res.json();
      setTransactions(data?.data || []); // adjust if API returns differently
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchTransactions = async () => {
    if (!query) return fetchTransactions();

    try {
      setLoading(true);
      const res = await fetch(`/api/transactions/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setTransactions(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions Dashboard</h1>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by sender, receiver, cause, or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchTransactions}>Search</Button>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Cause</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const incoming =
                    tx.receiver === "CURRENT_USER" || tx.sender === tx.receiver;
                  return (
                    <TableRow
                      key={tx.id}
                      className={
                        incoming
                          ? "bg-green-100 hover:bg-green-200"
                          : "bg-red-100 hover:bg-red-200"
                      }
                    >
                      <TableCell>{tx.id}</TableCell>
                      <TableCell>{tx.sender}</TableCell>
                      <TableCell>{tx.receiver}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.currency}</TableCell>
                      <TableCell>{tx.cause}</TableCell>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2">Page {page}</span>
        <Button onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
