import java.util.*;

class BankAccount713 {
    private int balance;

    BankAccount713(int balance) {
        this.balance = balance;
    }

    void deposit(int amount) {
        balance += amount;
    }

    int getBalance() {
        return balance;
    }
}

public class J713 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int init = sc.nextInt();
        int add = sc.nextInt();
        BankAccount713 acc = new BankAccount713(init);
        acc.deposit(add);
        System.out.print(acc.getBalance());
    }
}
