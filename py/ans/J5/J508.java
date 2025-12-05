public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            if (i == 3) continue;
            System.out.print(i);
            if (i < 5) System.out.print(" ");
        }
    }
}
