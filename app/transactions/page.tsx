"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Party {
  name?: string;
  account?: string;
}

interface Transaction {
  id: string;
  sender: string | Party;
  receiver: string | Party;
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

   
  const renderParty = (party: string | Party) => {
    if (typeof party === "string") return party;
    return `${party?.name ?? ""} (${party?.account ?? ""})`;
  };

   
  const getAccount = (party: string | Party) => {
    return typeof party === "string" ? party : party?.account ?? "";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions Dashboard</h1>

       
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by sender, receiver, cause, or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={searchTransactions} className="cursor-pointer">Search</Button>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
            </div>
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
                  const senderAcc = getAccount(tx.sender);
                  const receiverAcc = getAccount(tx.receiver);

                  const incoming =
                    receiverAcc === "CURRENT_USER" || senderAcc === receiverAcc;

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
                      <TableCell>{renderParty(tx.sender)}</TableCell>
                      <TableCell>{renderParty(tx.receiver)}</TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell>{tx.currency}</TableCell>
                      <TableCell>{tx.cause}</TableCell>
                      <TableCell>
                        {(() => {
                          const raw = tx.createdAt;

                          if (/^\d+$/.test(raw)) {
                            
                            let timestamp: number;
                            if (raw.length > 13) {
                            
                              timestamp = parseInt(raw.slice(0, 13));
                            } else if (raw.length === 10) {
                              
                              timestamp = parseInt(raw) * 1000;
                            } else {
                              timestamp = parseInt(raw);
                            }
                            return new Date(timestamp).toLocaleString();
                          }

                           
                          return new Date(raw).toLocaleString();
                        })()}
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
      <div className="flex justify-end mt-4 items-center gap-2">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="cursor-pointer"
        >
          Previous
        </Button>

        <span className="px-4 py-2">Page {page}</span>

        <Button onClick={() => setPage((p) => p + 1)} disabled={loading}
            className="cursor-pointer">
          Next
        </Button>
      </div>
    </div>
  );
}
